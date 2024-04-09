import { Router, json } from 'express';

import { db } from '../../../database.js';
import { doesEmailExist } from '../../../services/user/doesEmailExist.js';
import { createToken } from '../../../services/jwt/userToken/accessToken/createToken.js';
import { createNewUser } from '../../../services/user/createNewUser.js';
import { createDemoNote } from '../../../services/notes/createDemoNote.js';
import { StatusError } from '../../../shared/StatusError.js';
import { accessTokenCookieName } from '../../../services/cookie/userToken/accessToken/types.js';

import { validation } from './validation.js';

const signUpRouter = Router();

signUpRouter.use(json());

signUpRouter.post<
  Record<string, never>,
  unknown,
  { email: string; password: string }
>('/signup', validation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const client = await db.connect();

    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

      const emailExists = await doesEmailExist(email, client);

      if (emailExists.userEmail) {
        throw new StatusError('Specified email exists', 400);
      }

      if (emailExists.facebookEmail) {
        throw new StatusError('You have already registered with Facebook', 400);
      }

      if (emailExists.googleEmail) {
        throw new StatusError('You have already registered with Google', 400);
      }

      const userId = await createNewUser(email, password, client);

      await createDemoNote(userId, client);

      const accessToken = await createToken(userId, 'internal', client);

      await client.query('COMMIT');

      res
        .cookie(accessTokenCookieName, accessToken, {
          maxAge: 86_400_000,
          httpOnly: true,
          signed: true,
          secure: true,
          sameSite: true,
        })
        .status(204)
        .send();
    } catch (error) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

export { signUpRouter };
