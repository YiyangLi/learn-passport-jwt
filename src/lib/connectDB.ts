import {connect} from 'mongoose';

require('dotenv').config();

const conn = process.env.DB_STRING || 'mongodb://localhost:27017/abcd';

export default async function () {
  return await connect(conn);
}
