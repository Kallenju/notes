import { Router, json } from 'express';

import { db } from '../../../database.js';
import { doesFacebookUserExists } from '../../../services/facebookLogin/doesFacebookUserExists.js';
import { getUserByFacebookUserId } from '../../../services/facebookLogin/getUserByFacebookUserId.js';
import { verifyUserAccessToken } from '../../../services/facebookLogin/verifyUserAccessToken.js';
import { getFacebookEmailByUserId } from '../../../services/facebookLogin/getFacebookEmailByUserId.js';
import { updateUser } from '../../../services/facebookLogin/updateUser.js';
import { createToken } from '../../../services/jwt/userToken/accessToken/createToken.js';
import { createNewUser } from '../../../services/facebookLogin/createNewUser.js';
import { createDemoNote } from '../../../services/notes/createDemoNote.js';
import { StatusError } from '../../../shared/StatusError.js';
import { logger } from '../../../services/logger.js';
import { accessTokenCookieName } from '../../../services/cookie/userToken/accessToken/types.js';

import { validation } from './validation.js';

const signInRouter = Router();

signInRouter.use(json());

signInRouter.post<
  Record<string, never>,
  unknown,
  { facebookUserId: string; facebookAccessToken: string }
>('/signin', validation, async (req, res, next) => {
  try {
    const { facebookUserId, facebookAccessToken } = req.body;

    if (!(await verifyUserAccessToken(facebookAccessToken, facebookUserId))) {
      logger.error(
        `Facebook user access token is not valid:\nfacebookAccessToken=${facebookAccessToken}\nfacebookUserId=${facebookUserId}`,
      );

      throw new StatusError('Please try re-login.', 401);
    }

    const email = await getFacebookEmailByUserId(facebookUserId);

    const client = await db.connect();

    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

      const facebookUserExists = await doesFacebookUserExists(
        facebookUserId,
        client,
      );
      let userId: string | null = null;

      if (!facebookUserExists) {
        userId = await createNewUser(facebookUserId, email, client);

        await createDemoNote(userId, client);
      } else {
        const user = await getUserByFacebookUserId(facebookUserId, client);

        userId = user.userId;

        if (user.facebookEmail !== email) {
          await updateUser(facebookUserId, email, client);
        }
      }

      const accessToken = await createToken(userId, 'facebook', client);

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

export { signInRouter };
