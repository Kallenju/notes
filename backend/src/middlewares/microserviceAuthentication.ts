import type { RequestHandler } from 'express';

import { logger } from '../services/logger.js';
import { StatusError } from '../shared/StatusError.js';
import { verifyAndParseToken as verifyAndParseAuthToken } from '../services/jwt/microserviceToken/authToken/verifyAndParseToken.js';
import { verifyAndParseToken as verifyAndParseAccessToken } from '../services/jwt/microserviceToken/accessToken/verifyAndParseToken.js';

export function microserviceAuthentication(
  alg: 'authToken' | 'accessToken',
): RequestHandler {
  return async (req, _res, next): Promise<void> => {
    try {
      let token = req.get('Authorization');

      if (typeof token !== 'string') {
        logger.error(`Microservice ${alg} token is not provided`);

        throw new StatusError('Your credentials are wrong.', 401);
      }

      token = token.replace('Bearer ', '');

      const tokenData =
        alg === 'authToken'
          ? await verifyAndParseAuthToken(token)
          : await verifyAndParseAccessToken(token);

      req.microservice = tokenData.microserviceName;

      next();
    } catch (error) {
      next(error);
    }
  };
}
