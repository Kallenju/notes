import axios, { isAxiosError } from 'axios';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

export async function getFacebookEmailByUserId(
  facebookUserId: string,
  facebookUserToken: string,
): Promise<string> {
  return axios
    .get<{ email?: string }>(
      `https://graph.facebook.com/v19.0/${facebookUserId}`,
      {
        params: {
          fields: 'email',
          access_token: facebookUserToken,
        },
      },
    )
    .then((response) => {
      if (!response.data.email) {
        throw new StatusError(
          `No facebook email for ${facebookUserId}. Data: ${JSON.stringify(response.data)}.`,
          500,
        );
      }

      return response.data.email;
    })
    .catch((error) => {
      logger.error(
        `Cannot make Facebook request to get email:\n${error instanceof Error && error.stack ? error.stack : error}}\n${isAxiosError(error) ? `${error.cause}\n${error.message}` : ''}`,
      );

      throw new StatusError('Something went wrong.', 500);
    });
}
