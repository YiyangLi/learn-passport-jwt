import express, {Application, Request, Response} from 'express';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import bodyParser from 'body-parser';

const app: Application = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(authRouter);
app.use(usersRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
