import express, {Request, Response} from 'express';
import {isAuth} from '../lib/utils';
import _ from 'lodash';

const usersRouter = express.Router();

// Validate an existing user and issue a JWT
usersRouter.get('/users/me', isAuth, (req: Request, res: Response) => {
  res
    .status(200)
    .json(_.pick(req.user, 'username', 'tshirtsize', 'members', 'mamager'));
});

export default usersRouter;
