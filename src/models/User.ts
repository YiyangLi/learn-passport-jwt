import {Schema, model, Types} from 'mongoose';

interface IUser {
  username: string;
  tshirtsize: string;
  hash: string;
  salt: string;
}

const userSchema = new Schema<IUser>({
  username: {type: String, required: true},
  tshirtsize: {type: String, required: false, default: ''},
  hash: {type: String, required: true},
  salt: {type: String, required: true},
});

export type User = IUser & {
  _id: Types.ObjectId;
};

export const UserOdm = model<IUser>('User', userSchema);
