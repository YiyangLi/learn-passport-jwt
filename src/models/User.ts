import {Schema, model, Types} from 'mongoose';

interface IUser {
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

export type User = IUser & {
  _id: Types.ObjectId;
};

export const UserOdm = model<IUser>('User', userSchema);
