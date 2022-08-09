import {connect} from 'mongoose';

const conn =
  process.env.DB_STRING || 'mongodb://localhost:27017/learn-passport';

export default async function () {
  return await connect(conn);
}
