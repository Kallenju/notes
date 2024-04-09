import { Router, json } from 'express';

import { getUserAuthDataByEmail } from '../../../services/auth/getUserAuthDataByEmail.js';
import { createToken } from '../../../services/jwt/userToken/accessToken/createToken.js';
import { verifyPassword } from '../../../services/auth/verifyPassword.js';
import { StatusError } from '../../../shared/StatusError.js';
import { accessTokenCookieName } from '../../../services/cookie/userToken/accessToken/types.js';
import { db } from '../../../database.js';

import { validation } from './validation.js';

const loginRouter = Router();

loginRouter.use(json());

loginRouter.post<
  Record<string, never>,
  unknown,
  { email: string; password: string }
>('/login', validation, async (req, res, next) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

    const { email, password } = req.body;

    const userAuthData = await getUserAuthDataByEmail(email, client);

    if (!userAuthData) {
      throw new StatusError('Email or password is wrong', 401);
    }

    const isPasswordCorrect = verifyPassword(
      password,
      userAuthData.password,
      userAuthData.salt,
    );

    if (!isPasswordCorrect) {
      throw new StatusError('Email or password is wrong', 401);
    }

    const accessToken = await createToken(userAuthData.id, 'internal', client);

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

    next(error);
  } finally {
    client.release();
  }
});

export { loginRouter };
