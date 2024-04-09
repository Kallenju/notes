import { logger } from '../../../logger.js';
import { accessTokenCookieName } from './types.js';
import { StatusError } from '../../../../shared/StatusError.js';

export function getAccessTokenFromCookies(
  cookies: Record<string, unknown>,
): string {
  const accessTokenCookie: unknown = cookies[accessTokenCookieName];

  if (typeof accessTokenCookie !== 'string') {
    logger.error(
      `Token is incorrect or not found accessTokenCookie=${accessTokenCookie}`,
    );

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  return accessTokenCookie;
}
