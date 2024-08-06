import axios, { isAxiosError } from 'axios';

import { getSecureRequestParams } from './getSecureRequestParams.js';
import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

export async function verifyUserAccessToken(
  token: string,
  facebookUserId: string,
): Promise<boolean> {
  const secureParams = await getSecureRequestParams();

  return axios
    .get<{
      data: {
        app_id: number;
        type: string | 'USER';
        application: string;
        expires_at: number;
        is_valid: boolean;
        issued_at: number;
        metadata: Record<string, string>;
        scopes: string[];
        user_id: string;
      };
    }>(`https://graph.facebook.com/v19.0/debug_token`, {
      params: {
        input_token: token,
        access_token: secureParams.appAccessToken,
      },
    })
    .then(({ data: { data } }) => {
      if (
        !data.is_valid ||
        data.type !== 'USER' ||
        data.user_id !== facebookUserId
      ) {
        return false;
      }

      return true;
    })
    .catch((error) => {
      logger.error(
        `Cannot make a verify Facebook user access token request:\n${error instanceof Error && error.stack ? error.stack : error}\n${isAxiosError(error) ? `${error.cause}\n${error.message}` : ''}`,
      );

      throw new StatusError('Something went wrong.', 500);
    });
}
