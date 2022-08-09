import express, {Request, Response} from 'express';
import connectDB from '../lib/connectDB';

import {issueJWT, genPassword} from '../lib/utils';

import {UserOdm, User} from '../models/User';
import passport from 'passport';

const authRouter = express.Router();

// Validate an existing user and issue a JWT
authRouter.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success',
  })
);

// Register a new user
authRouter.post('/register', async (req, res) => {
  await connectDB();
  const user = await UserOdm.findOne({username: req.body.username});
  if (user) {
    res.status(400).send('choose a different username, please');
    return;
  }
  const saltHash = genPassword(req.body.password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new UserOdm({
    username: req.body.username,
    tShirtSize: req.body.tShirtSize,
    manager: req.body.manager,
    hash: hash,
    salt: salt,
  });

  try {
    await newUser.save();
    return res.send(
      '<div>Registration done, click to <a href="/login">Login</a></div>'
    );
  } catch (err) {
    return res.json({success: false, message: err});
  }
});

authRouter.get('/login', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect('/login-success');
  } else {
    const form = `
    <h1>Login Page</h1>
    <form method="POST" action="/login">
      User Name:<div><input placeholder="user@example.com" type="text" name="username"></div>
      Password: <div><input type="password" name="password"></div>
      <div><input type="submit" value="Submit"></div>
    </form>`;

    return res.send(form);
  }
});

authRouter.get('/login-success', (req: Request, res: Response) => {
  return res.send(`
        <div>You successfully logged in. </div>
        <div>username: ${(req.user! as User).username} </div>
        <div>click to <a href="/token">generate a token</a></div>
        <div>click to <a href="/logout">logout</a></div>
        `);
});

authRouter.get('/login-failure', (req: Request, res: Response) => {
  res.send(`
    <div>Wrong Password </div>
    <div>click to <a href="/login">retry</a></div>
  `);
});

authRouter.get('/token', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const tokenObject = issueJWT(req.user as User);
    return res.status(200).json(tokenObject);
  } else {
    return res.status(401).send(`
      <div>You are not allowed to get a new token</div>
      <div>Click to <a href="/logout">logout</a>, login and try again.</div>
    `);
  }
});

authRouter.get('/register', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.send(`
      <div>You login as ${(req.user as User).username} </div>
      <div>To register a new user, click to <a href="/logout">logout</a></div>
    `);
  } else {
    const form = `
    <h1>Register</h1>
    <form method="POST" action="/register">
      User Name:<div><input placeholder="user@example.com" type="text" name="username"></div>
      Password: <div><input type="password" name="password"></div>
      T-shirt Size: <div><input type="text" placeholder="S/M/L/XL" name="tShirtSize"></div>
      Manager: <div><input type="text" placeholder="Your Manager's username" name="manager"></div>
      <div><input type="submit" value="Submit"></div>
    </form>`;

    res.send(form);
  }
});

authRouter.get('/logout', (req: Request, res: Response) => {
  req.logout(err => console.log(err));
  res.redirect('/login');
});

export default authRouter;
