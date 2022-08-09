import express, {NextFunction, Request, Response} from 'express';
import _ from 'lodash';
import passport from 'passport';
import errors from '../lib/errors';
import {canDeleteUser, canUpdateUser, canViewUser} from '../lib/utils';
import {User, UserOdm} from '../models/User';

const usersRouter = express.Router();

// Validate an existing user and issue a JWT
usersRouter.get(
  '/api/v1/users',
  passport.authenticate('jwt', {session: true}),
  (req: Request, res: Response) => {
    const requester = req.user as User;
    const filter = requester.isAdmin
      ? {}
      : {username: [requester.username, ...requester.members]};
    UserOdm.find(filter).then((users: User[]) => {
      res.status(200).json(users.map(u => formatUser(u)));
    });
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
    UserOdm.deleteOne({_id: req.params.userId})
      .then(() => {
        res.status(204);
      })
      .catch(() => {
        res.status(501).json(errors[500]);
      });
  }
);

usersRouter.delete(
  '/api/v1/users/:userId',
  passport.authenticate('jwt', {session: false}),
  canDeleteUser,
  (req: Request, res: Response) => {
    UserOdm.deleteOne({_id: req.params.userId})
      .then(() => {
        res.status(204);
      })
      .catch(() => {
        res.status(501).json(errors[500]);
      });
  }
);

usersRouter.put(
  '/api/v1/users/:userId',
  passport.authenticate('jwt', {session: false}),
  canUpdateUser,
  async (req: Request, res: Response) => {
    const requester = req.body.user as User;
    const profileToUpdate = requester.isAdmin
      ? _.pick(req.body, 'tShirtSize', 'members', 'manager')
      : _.pick(req.body, 'tShirtSize');
    const updated = await UserOdm.updateOne(
      {_id: req.params.userId},
      profileToUpdate
    ).exec();

    if (updated.modifiedCount) {
      const updatedUser = await UserOdm.findOne({
        _id: req.params.userId,
      }).exec();
      res.status(200).json(formatUser(updatedUser!));
    } else {
      res.status(200).json({});
    }
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
