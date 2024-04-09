import axios from 'axios';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

let pemKeys: Record<string, string> | null = null;
let maxAge: Date | null = null;

export async function getPEMPublicKey(kid: string): Promise<string> {
  if (!pemKeys || !maxAge || maxAge >= new Date()) {
    await axios
      .request<Record<string, string>>({
        url: 'https://www.googleapis.com/oauth2/v1/certs',
      })
      .then((response) => {
        const maxAgeFromHeader =
          response.headers['cache-control'].match(/max-age=(\d+)/)[1];

        if (typeof maxAgeFromHeader !== 'string') {
          logger.error(
            `Cannot get maxAget from Cache-Control from google public keys response:\nheader=${response.headers['cache-control']}`,
          );

          throw new StatusError('Something went wrong.', 500);
        }

        const maxAgeFromHeaderNumber = Number(maxAgeFromHeader);

        if (typeof maxAgeFromHeaderNumber !== 'number') {
          logger.error(
            `Cannot get number from maxAgeFromHeader value:\nmaxAgeFromHeader=${maxAgeFromHeader}`,
          );

          throw new StatusError('Something went wrong.', 500);
        }

        pemKeys = { ...response.data };

        maxAge = new Date(Date.now() + maxAgeFromHeaderNumber * 1000);
      });
  }

  const key = pemKeys?.[kid];

  if (!key) {
    logger.error(
      `Cannot get pem key:\nkid=${kid}\nkeys=${JSON.stringify(pemKeys)}`,
    );

    throw new StatusError('Something went wrong.', 500);
  }

  return key;
}
