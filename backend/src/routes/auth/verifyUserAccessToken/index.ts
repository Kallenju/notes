import { Router, json } from 'express';

import { microserviceAuthentication } from '../../../middlewares/microserviceAuthentication.js';

import { verifyAndParseToken } from '../../../services/jwt/userToken/accessToken/verifyAndParseToken.js';
import { getUserEmailById } from '../../../services/user/getUserEmailById.js';
import { StatusError } from '../../../shared/StatusError.js';
import { getAccessTokenFromUnparsedCookie } from '../../../services/cookie/userToken/accessToken/getAccessTokenFromUnparsedCookie.js';

import { validation } from './validation.js';

const verifyUserAccessTokenRouter = Router();

verifyUserAccessTokenRouter.use(json());

verifyUserAccessTokenRouter.post<
  Record<string, never>,
  { tokenIsValid: false } | { tokenIsValid: true; email: string },
  { unparsedAccessTokenCookie: string }
>(
  '/verify-access-token',
  validation,
  microserviceAuthentication('accessToken'),
  async (req, res, next) => {
    try {
      let token: string | null = null;

      try {
        token = getAccessTokenFromUnparsedCookie(
          req.body.unparsedAccessTokenCookie,
        );
      } catch (error) {
        if (error instanceof StatusError && error.code === 401) {
          res.status(200).send({ tokenIsValid: false });

          return;
        }

        throw error;
      }

      try {
        const { userId, loginType } = await verifyAndParseToken(token);
        const emails = await getUserEmailById(userId);

        let email: string | null = null;

        switch (loginType) {
          case 'internal': {
            email = emails.userEmail;

            break;
          }
          case 'google': {
            email = emails.googleEmail;

            break;
          }
          case 'facebook': {
            email = emails.facebookEmail;

            break;
          }
        }

        if (!email) {
          res.status(200).send({ tokenIsValid: false });

          return;
        }

        res.status(200).send({ tokenIsValid: true, email });
      } catch (error) {
        if (error instanceof StatusError && error.code === 401) {
          res.status(200).send({ tokenIsValid: false });

          return;
        }

        throw error;
      }
    } catch (error) {
      next(error);
    }
  },
);

export { verifyUserAccessTokenRouter };
