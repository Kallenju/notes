import jwt from 'jsonwebtoken';

import { logger } from '../../../logger.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { doesUserExist } from '../../../user/doesUserExist.js';
import { isTokenRevoked } from './isTokenRevoked.js';
import { config } from '../../../../shared/config.js';

import type { TLoginTypes } from './types.js';
import { isLoginType } from './types.js';

export async function verifyAndParseToken(
  token: string,
): Promise<{ userId: string; loginType: TLoginTypes; scope: 'user' }> {
  let tokenPayload: string | jwt.JwtPayload;

  try {
    tokenPayload = jwt.verify(token, config.ACCESS_TOKEN_JWT_SECRET, {
      algorithms: [config.ACCESS_TOKEN_JWT_ALGORITHM],
      complete: true,
      ignoreExpiration: false,
    }).payload;
  } catch (error) {
    logger.error(
      `Cannot verify user access token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  if (
    typeof tokenPayload === 'string' ||
    typeof tokenPayload?.sub !== 'string' ||
    !isLoginType(tokenPayload?.loginType) ||
    tokenPayload?.scope !== 'user'
  ) {
    logger.error(
      `User access token is malformed: tokenPayload=${JSON.stringify(tokenPayload)}`,
    );

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  if (!(await doesUserExist(tokenPayload.sub))) {
    logger.error(`User does not exist: userId=${tokenPayload.sub}`);

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  if (await isTokenRevoked(token)) {
    logger.error(`Token is revoked: token=${JSON.stringify(token)}`);

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  return {
    userId: tokenPayload.sub,
    loginType: tokenPayload.loginType,
    scope: 'user',
  };
}
