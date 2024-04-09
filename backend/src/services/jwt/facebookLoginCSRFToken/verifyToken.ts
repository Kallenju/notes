import jwt from 'jsonwebtoken';

import { logger } from '../../logger.js';
import { StatusError } from '../../../shared/StatusError.js';
import { config } from '../../../shared/config.js';

export function verifyToken(token: string): void {
  let tokenPayload: string | jwt.JwtPayload;

  try {
    tokenPayload = jwt.verify(token, config.FACEBOOK_CSRF_TOKEN_JWT_SECRET, {
      algorithms: [config.FACEBOOK_CSRF_TOKEN_JWT_ALGORITHM],
      complete: true,
      ignoreExpiration: false,
    }).payload;
  } catch (error) {
    logger.error(
      `Cannot verify facebook csrf token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Please try re-login.', 401);
  }

  if (
    typeof tokenPayload === 'string' ||
    tokenPayload?.scope !== 'facebook_csrf'
  ) {
    logger.error(
      `User facebook csrf token is malformed: tokenPayload=${JSON.stringify(tokenPayload)}`,
    );

    throw new StatusError('Please try re-login.', 401);
  }
}
