import express, {Request, Response} from 'express';
import connectDB from '../lib/connectDB';

import {issueJWT, genPassword, isAuth} from '../lib/utils';

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
    return res.send('choose a different username, please');
  }
  const saltHash = genPassword(req.body.password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new UserOdm({
    username: req.body.username,
    tshirtSize: req.body.tshirtSize,
    hash: hash,
    salt: salt,
  });

  try {
    await newUser.save();
    return res.send(
      '<div>Registration done, click to <a href="/login">Login</a></div>'
    );
  } catch (err) {
    return res.json({success: false, msg: err});
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

authRouter.get('/token', isAuth, (req: Request, res: Response) => {
  const tokenObject = issueJWT(req.user as User);
  return res.send(`
        <div>Token: ${tokenObject.token} </div>
        <div>Expiry: ${tokenObject.expires} </div>
        `);
});

authRouter.get('/register', (req: Request, res: Response) => {
  const form = `
    <h1>Register</h1>
    <form method="POST" action="/register">
      User Name:<div><input placeholder="user@example.com" type="text" name="username"></div>
      Password: <div><input type="password" name="password"></div>
      T-shirt Size: <div><input type="text" placeholder="S/M/L/XL" name="tshirtSize"></div>
      <div><input type="submit" value="Submit"></div>
    </form>`;

  res.send(form);
});

authRouter.get('/logout', (req: Request, res: Response) => {
  req.logout(err => console.log(err));
  res.redirect('/login');
});

export default authRouter;
