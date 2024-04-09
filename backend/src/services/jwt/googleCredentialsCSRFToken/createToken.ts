import jwt from 'jsonwebtoken';

import { logger } from '../../logger.js';
import { StatusError } from '../../../shared/StatusError.js';
import { config } from '../../../shared/config.js';

export function createToken(): string {
  try {
    return jwt.sign(
      {
        scope: 'google_csrf',
      },
      config.GOOGLE_CSRF_TOKEN_JWT_SECRET,
      {
        algorithm: config.GOOGLE_CSRF_TOKEN_JWT_ALGORITHM,
        expiresIn: config.GOOGLE_CSRF_TOKEN_JWT_TOKEN_LIFE_TIME,
        header: {
          alg: config.GOOGLE_CSRF_TOKEN_JWT_ALGORITHM,
          typ: 'JWT',
        },
      },
    );
  } catch (error) {
    logger.error(
      `Cannot create user google csrf token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Something went wrong.', 500);
  }
}
