import jwt from 'jsonwebtoken';

import { logger } from '../../../logger.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { isTokenRevoked } from './isTokenRevoked.js';
import { config } from '../../../../shared/config.js';
import { type TMicroserviceNames, isMicroserviceName } from '../types.js';

export async function verifyAndParseToken(token: string): Promise<{
  scope: 'microservice';
  microserviceName: TMicroserviceNames;
}> {
  let tokenPayload: string | jwt.JwtPayload;

  try {
    tokenPayload = jwt.verify(token, config.MICROSERVICE_TOKEN_JWT_SECRET, {
      algorithms: [config.MICROSERVICE_TOKEN_JWT_ALGORITHM],
      complete: true,
      ignoreExpiration: false,
    }).payload;
  } catch (error) {
    logger.error(
      `Cannot verify microservice access token=${token}:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Microservice must re-login.', 401);
  }

  if (
    typeof tokenPayload === 'string' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !isMicroserviceName(tokenPayload.sub) ||
    tokenPayload?.scope !== 'microservice' ||
    typeof tokenPayload?.tokenUUID !== 'string'
  ) {
    logger.error(
      `Microservice access token payload is wrong: ${JSON.stringify(tokenPayload)}.`,
    );

    throw new StatusError('Microservice access token is wrong.', 401);
  }

  if (await isTokenRevoked(tokenPayload.tokenUUID)) {
    logger.error(`Microservice access token is revoked: token=${token}.`);

    throw new StatusError('Microservice access token is wrong.', 401);
  }

  return {
    scope: 'microservice',
    microserviceName: tokenPayload.sub,
  };
}
