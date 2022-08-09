import express, {Request, Response} from 'express';
import _ from 'lodash';
import passport from 'passport';
import errors from '../lib/errors';
import {
  canCreateUser,
  canDeleteUser,
  canUpdateUser,
  canViewUser,
  genPassword,
} from '../lib/utils';
import {User} from '../models/types';
import {UserOdm} from '../models/User';

const usersRouter = express.Router();

// Validate an existing user and issue a JWT
usersRouter.get(
  '/api/v1/users',
  passport.authenticate('jwt', {session: true}),
  async (req: Request, res: Response) => {
    const requester = req.user as User;
    let users: User[] = [];
    if (requester.isAdmin) {
      users = await UserOdm.find().exec();
    } else {
      users = await UserOdm.find()
        .where('_id')
        .in([requester._id, ...requester.members])
        .exec();
    }
    res.status(200).json(users.map(formatUser));
  }
);

usersRouter.get(
  '/api/v1/users/:userId',
  passport.authenticate('jwt', {session: false}),
  canViewUser,
  (req: Request, res: Response) => {
    UserOdm.findById(req.params.userId).then((user: User | null) => {
      if (user === null) {
        res.status(404).json(errors[404]);
      } else {
        res.status(200).json(formatUser(user));
      }
    });
  }
);

usersRouter.delete(
  '/api/v1/users/:userId',
  passport.authenticate('jwt', {session: false}),
  canDeleteUser,
  (req: Request, res: Response) => {
    UserOdm.findByIdAndDelete(req.params.userId)
      .then(() => {
        res.status(204).json();
      })
      .catch(() => {
        res.status(501).json(errors[500]);
      });
  }
);

usersRouter.post(
  '/api/v1/users',
  passport.authenticate('jwt', {session: false}),
  canCreateUser,
  async (req: Request, res: Response) => {
    // Todo: duped from authRoutes, clean it up later.
    if (!req.body.password || !req.body.username) {
      res.status(400).json(errors[400]);
      return;
    }
    const user = await UserOdm.findOne({username: req.body.username});
    if (user) {
      res.status(409).json(errors[409]);
      return;
    }
    const saltHash = genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new UserOdm({
      username: req.body.username,
      tShirtSize: req.body.tShirtSize,
      manager: req.body.manager,
      members: req.body.members,
      hash: hash,
      salt: salt,
    });

    try {
      const user = await newUser.save();
      return res.status(200).json(formatUser(user));
    } catch (err) {
      return res.status(500).json(errors[500]);
    }
  }
);

usersRouter.put(
  '/api/v1/users/:userId',
  passport.authenticate('jwt', {session: false}),
  canUpdateUser,
  async (req: Request, res: Response) => {
    const requester = req.user as User;
    const profileToUpdate = requester.isAdmin
      ? _.pick(req.body, 'tShirtSize', 'members', 'manager')
      : _.pick(req.body, 'tShirtSize');
    await UserOdm.updateOne({_id: req.params.userId}, profileToUpdate).exec();

    const updatedUser = await UserOdm.findOne({
      _id: req.params.userId,
    }).exec();
    res.status(200).json(formatUser(updatedUser!));
  }
);

const formatUser = (user: User | null) => {
  return _.pick(
    user || {},
    'username',
    'tShirtSize',
    'members',
    'manager',
    'id'
  );
};

export default usersRouter;
