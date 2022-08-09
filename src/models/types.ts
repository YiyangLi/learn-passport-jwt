import {Types} from 'mongoose';

export interface IUser {
  username: string;
  tShirtSize: string;
  isAdmin: boolean;
  members: string[];
  manager: string;
  hash: string;
  salt: string;
  createdAt: Date;
  lastUpdated: Date;
}

export type User = IUser & {
  _id: Types.ObjectId;
};
