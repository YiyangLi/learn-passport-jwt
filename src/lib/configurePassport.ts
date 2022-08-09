import passport from 'passport';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import {Strategy as LocalStrategy} from 'passport-local';
import fs from 'fs';
import path from 'path';
import {User, UserOdm} from '../models/User';
import {validPassword} from './utils';
import connectDB from './connectDB';

const keyFolder = process.env.KEY_FOLDER || '../../keypair';
const pathToKey = path.join(__dirname, keyFolder, 'id_rsa.pub');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const localOptions = {
  usernameField: 'username',
  passwordField: 'password',
};

export default function () {
  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      await connectDB();
      UserOdm.findOne({_id: jwt_payload.sub})
        .then((user: User | null) => {
          if (!user) {
            return done(undefined, false, {message: 'User isnot found.'});
          } else {
            return done(undefined, user);
          }
        })
        .catch((error: NativeError) => {
          return done(error, false);
        });
    })
  );

  passport.use(
    new LocalStrategy(localOptions, async (username, password, done) => {
      await connectDB();
      UserOdm.findOne({username: username})
        .then((user: User | null) => {
          if (!user) {
            return done(undefined, false, {message: 'User isnot found.'});
          } else {
            const isValid = validPassword(password, user.hash, user.salt);
            if (isValid) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          }
        })
        .catch((error: NativeError) => {
          return done(error, false);
        });
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (userId: string, done) => {
    await connectDB();
    UserOdm.findById(userId)
      .then(user => {
        done(null, user);
      })
      .catch(err => done(err));
  });
}
