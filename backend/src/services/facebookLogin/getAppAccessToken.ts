import axios, { isAxiosError } from 'axios';

import { config } from '../../shared/config.js';
import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

let appAccessToken =
  config.NODE_ENV === 'production'
    ? null
    : new Promise<string>((r) =>
        r(config.FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN),
      );

export async function getAppAccessToken(): Promise<string> {
  if (config.NODE_ENV !== 'production') {
    return appAccessToken!;
  }

  if (!appAccessToken) {
    appAccessToken = axios
      .get<{ access_token: string }>(
        'https://graph.facebook.com/oauth/access_token',
        {
          params: {
            client_id: config.FACEBOOK_APP_ID,
            client_secret: config.FACEBOOK_APP_SECRET,
            grant_type: 'client_credentials',
          },
        },
      )
      .then((result) => {
        return result.data.access_token;
      })
      .catch((error) => {
        logger.error(
          `Cannot make a request for an app access token:\n${error instanceof Error && error.stack ? error.stack : error}\n${isAxiosError(error) ? `${error.cause}\n${error.message}\n${error.response?.data.message}` : ''}`,
        );

        throw new StatusError('Something went wrong.', 500);
      });
  }

  return appAccessToken!;
}
