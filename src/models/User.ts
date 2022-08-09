import {Schema, model} from 'mongoose';
import {IUser} from './types';

const userSchema = new Schema<IUser>({
  username: {type: String, required: true},
  tShirtSize: {type: String, required: false, default: ''},
  manager: {type: String, required: false, default: ''},
  members: {type: [String], required: false, default: []},
  isAdmin: {type: Boolean, required: false, default: false},
  createdAt: {type: Date, default: Date.now},
  lastUpdated: {type: Date, default: Date.now},
  hash: {type: String, required: true},
  salt: {type: String, required: true},
});

export const UserOdm = model<IUser>('User', userSchema);
