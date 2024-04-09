import jwt from 'jsonwebtoken';

import { logger } from '../../logger.js';
import { StatusError } from '../../../shared/StatusError.js';
import { config } from '../../../shared/config.js';

export function verifyToken(token: string): void {
  let tokenPayload: string | jwt.JwtPayload;

  try {
    tokenPayload = jwt.verify(token, config.GOOGLE_CSRF_TOKEN_JWT_SECRET, {
      algorithms: [config.GOOGLE_CSRF_TOKEN_JWT_ALGORITHM],
      complete: true,
      ignoreExpiration: false,
    }).payload;
  } catch (error) {
    logger.error(
      `Cannot verify google csrf token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Please try re-login.', 401);
  }

  if (
    typeof tokenPayload === 'string' ||
    tokenPayload?.scope !== 'google_csrf'
  ) {
    logger.error(
      `User google csrf token is malformed: tokenPayload=${JSON.stringify(tokenPayload)}`,
    );

    throw new StatusError('Please try re-login.', 401);
  }
}
