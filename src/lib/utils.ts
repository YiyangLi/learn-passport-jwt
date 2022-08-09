import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import {User} from '../models/types';
import {NextFunction, Request, Response} from 'express';

const notAuthorized = {
  message: 'Not Authorized',
};
const isTestEnv = process.env.NODE_ENV === 'test';
if (!isTestEnv) {
  dotenv.config();
}
const keyFolder = process.env.KEY_FOLDER || '../../keypair';
const privKeyName = process.env.PRIV_KEY_NAME || 'id_rsa';
const pathToKey = path.join(__dirname, keyFolder, privKeyName);
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
export function validPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === hashVerify;
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 */
export function genPassword(password: string) {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return {
    salt: salt,
    hash: genHash,
  };
}

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @param {*} privateKey - used to tests to override the private key generated via generateKeypair.js
 */
export const issueJWT = (
  user: User,
  privateKey: string = PRIV_KEY
): {token: string; expires: string} => {
  const _id = user._id;

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, privateKey, {
    expiresIn: expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
};

/**
 * @param {Request} req - the request.params.userId is the resource id
 * @returns {*} status 401 is not allowed, next() if allowed
 */
export const canViewUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (canViewOne(req.user! as User, req.params.userId)) {
    next();
  } else {
    res.status(401).json(notAuthorized);
  }
};

/**
 * @param {Request} req - the request.params.userId is the resource id
 * @returns {*} status 401 is not allowed, next() if allowed
 */
export const canUpdateUser = canViewUser;

/**
 * @param {Request} req - the request.params.userId is the resource id
 * @returns {*} status 401 is not allowed, next() if allowed
 */
export const canDeleteUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (canDeleteOne(req.user! as User)) {
    next();
  } else {
    res.status(401).json(notAuthorized);
  }
};

/**
 * @param {Request} req - the request.params.userId is the resource id
 * @returns {*} status 401 is not allowed, next() if allowed
 */
export const canCreateUser = canDeleteUser;

/**
 * Determine if the user can view the resource id
 * @param {User} user - the user who tries to access the resource
 * @param {string} resourceId - the resource id
 * @returns {boolean} - true if accessible
 */
const canViewOne = (user: User, resourceId: string): boolean => {
  return (
    user.isAdmin ||
    user._id.toString() === resourceId ||
    user.members.includes(resourceId)
  );
};

/**
 * Determine if the user can delete the resource
 * @param {User} user - the user who tries to access the resource
 * @param {string} resourceId - the id of the resource
 * @returns {boolean} - true if accessible
 */
const canDeleteOne = (user: User): boolean => {
  return user.isAdmin;
};
