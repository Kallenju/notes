import cookieParser from 'cookie-parser';

import { logger } from '../../../logger.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { config } from '../../../../shared/config.js';

export function getAccessTokenFromUnparsedCookie(signedCookie: string): string {
  const token = cookieParser.signedCookie(signedCookie, config.COOKIE_SECRET);

  if (typeof token !== 'string') {
    logger.error(
      `User access token is incorrect or not found in provided cookie=${signedCookie}`,
    );

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  return token;
}
