import express from 'express';
import {isAuth} from '../lib/utils';
import _ from 'lodash';

const usersRouter = express.Router();

// Validate an existing user and issue a JWT
usersRouter.get('/users/me', isAuth, (req, res, next) => {
  res.send(JSON.stringify(_.pick(req.user, 'username', 'tshirtsize')));
});

export default usersRouter;
