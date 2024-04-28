import { Router, json } from 'express';

import { db } from '../../../database.js';
import { doesGoogleUserExists } from '../../../services/googleLogin/doesGoogleUserExists.js';
import { getUserByGoogleUserId } from '../../../services/googleLogin/getUserByGoogleUserId.js';
import { verifyAndParseToken as verifyAndParseCredentials } from '../../../services/jwt/googleCredentials/verifyAndParseToken.js';
import { createToken } from '../../../services/jwt/userToken/accessToken/createToken.js';
import { createNewUser } from '../../../services/googleLogin/createNewUser.js';
import { createDemoNote } from '../../../services/notes/createDemoNote.js';
import { StatusError } from '../../../shared/StatusError.js';
import { logger } from '../../../services/logger.js';
import { accessTokenCookieName } from '../../../services/cookie/userToken/accessToken/types.js';

import { validation } from './validation.js';

const signInRouter = Router();

signInRouter.use(json());

signInRouter.post<Record<string, never>, unknown, { credential: string }>(
  '/signin',
  validation,
  async (req, res, next) => {
    try {
      const { credential } = req.body;

      const parsedCredential = await verifyAndParseCredentials(credential);

      if (!parsedCredential.emailVerified) {
        logger.error(
          `Google email is not verified:\nemail=${parsedCredential.email}`,
        );

        throw new StatusError('Please verify your Google email.', 400);
      }

      const client = await db.connect();

      try {
        await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

        const googleUserExists = await doesGoogleUserExists(
          parsedCredential.userId,
          client,
        );

        let userId: string | null = null;

        if (!googleUserExists) {
          const result = await createNewUser(
            parsedCredential.userId,
            parsedCredential.email,
            client,
          );

          userId = result.userId;

          if (!result.alreadyExistingProfile) {
            await createDemoNote(userId, client);
          }
        } else {
          const user = await getUserByGoogleUserId(
            parsedCredential.userId,
            client,
          );

          userId = user.userId;
        }

        const accessToken = await createToken(userId, 'google', client);

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
  },
);

export { signInRouter };
