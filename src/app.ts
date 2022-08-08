import express, {Application, Request, Response} from 'express';
import session from 'express-session';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import bodyParser from 'body-parser';
import configurePassport from './lib/configurePassport';
import passport from 'passport';
import MongoStore from 'connect-mongo';

const app: Application = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const conn = process.env.DB_STRING || 'mongodb://localhost:27017/abcd';
const sessionStore = new MongoStore({
  mongoUrl: `${conn}`,
});

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
});
app.use(authRouter);
app.use(usersRouter);

app.listen(port);
