import type { RequestHandler } from 'express';

import { getAccessTokenFromCookies } from '../services/cookie/userToken/accessToken/getAccessTokenFromCookies.js';
import { verifyAndParseToken } from '../services/jwt/userToken/accessToken/verifyAndParseToken.js';

export function authentication(): RequestHandler {
  return async (req, _res, next): Promise<void> => {
    try {
      const { userId } = await verifyAndParseToken(
        getAccessTokenFromCookies(req.signedCookies),
      );

      req.userId = userId;

      next();
    } catch (error) {
      next(error);
    }
  };
}
