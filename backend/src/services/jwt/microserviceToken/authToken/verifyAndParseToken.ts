import jwt from 'jsonwebtoken';

import { logger } from '../../../logger.js';
import { config } from '../../../../shared/config.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { type TMicroserviceNames, isMicroserviceName } from '../types.js';

export async function verifyAndParseToken(
  rsaToken: string,
): Promise<{ scope: 'microservice'; microserviceName: TMicroserviceNames }> {
  let decodedToken: jwt.Jwt | null = null;

  try {
    decodedToken = jwt.decode(rsaToken, { complete: true });
  } catch (error) {
    logger.error(
      `Cannot decode microservice auth token=${rsaToken}:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Microservice auth token is wrong.', 401);
  }

  if (
    !decodedToken ||
    typeof decodedToken.payload === 'string' ||
    !isMicroserviceName(decodedToken.payload.sub) ||
    decodedToken.payload.scope !== 'microservice'
  ) {
    logger.error(
      `Microservice auth token payload is wrong: ${JSON.stringify(decodedToken?.payload)}.`,
    );

    throw new StatusError('Microservice auth token is wrong.', 401);
  }

  let key: string | null = null;

  switch (decodedToken.payload.sub) {
    case 'frontendServer': {
      key = config.FRONTEND_SERVER_PUBLIC_KEY;
    }
  }

  try {
    jwt.verify(rsaToken, key, {
      algorithms: ['RS256'],
      complete: true,
    });
  } catch (error) {
    logger.error(
      `Cannot verify microservice auth token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Microservice auth token is wrong.', 401);
  }

  return {
    scope: 'microservice',
    microserviceName: decodedToken.payload.sub,
  };
}
