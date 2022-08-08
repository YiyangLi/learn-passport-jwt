import express, {Request, Response} from 'express';
import connectDB from '../lib/connectDB';

import {validPassword, issueJWT, genPassword} from '../lib/utils';

import {UserOdm} from '../models/User';

const authRouter = express.Router();

// Validate an existing user and issue a JWT
authRouter.post('/login', async (req, res) => {
  await connectDB();
  const user = await UserOdm.findOne({username: req.body.username});
  if (!user) {
    return res.redirect('/login-failure');
  }

  // Function defined at bottom of app.js
  const isValid = validPassword(req.body.password, user.hash, user.salt);

  if (isValid) {
    const tokenObject = issueJWT(user);

    return res.send(`
        <div>You successfully logged in. </div>
        <div>Token: ${tokenObject.token} </div>
        <div>Expiry: ${tokenObject.expires} </div>
        `);
  } else {
    return res.redirect('/login-failure');
  }
});

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
    res.send(
      '<div>Registration done, click to <a href="/login">Login</a></div>'
    );
  } catch (err) {
    return res.json({success: false, msg: err});
  }
});

authRouter.get('/login', (req: Request, res: Response) => {
  const form = `
    <h1>Login Page</h1>
    <form method="POST" action="/login">
      User Name:<div><input placeholder="user@example.com" type="text" name="username"></div>
      Password: <div><input type="password" name="password"></div>
      <div><input type="submit" value="Submit"></div>
    </form>`;

  res.send(form);
});

authRouter.get('/login-failure', (req: Request, res: Response) => {
  res.send('You entered the wrong password.');
});

authRouter.get('/register', (req, res, next) => {
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

export default authRouter;
