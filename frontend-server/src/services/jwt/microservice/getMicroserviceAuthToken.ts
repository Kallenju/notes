import jwt from 'jsonwebtoken';

import { config } from '../../../shared/config.js';

export function getMicroserviceAuthToken(): string {
  return jwt.sign(
    {
      sub: 'frontendServer',
      scope: 'microservice',
    },
    { key: config.AUTH_PRIVATE_KEY, passphrase: config.AUTH_PASSPHRASE },
    { algorithm: config.AUTH_ALGORITHM },
  );
}
