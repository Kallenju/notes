import axios, { isAxiosError } from 'axios';

import { getSecureRequestParams } from './getSecureRequestParams.js';
import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

export async function getFacebookEmailByUserId(
  facebookUserId: string,
): Promise<string> {
  const secureParams = await getSecureRequestParams();

  return axios
    .request<{ email?: string }>({
      method: 'GET',
      url: `https://graph.facebook.com/v19.0/${facebookUserId}`,
      params: {
        fields: 'email',
        access_token: secureParams.appAccessToken,
        // appsecret_proof: secureParams.appSecretProof,
        // appsecret_time: secureParams.appSecretTime,
      },
    })
    .then(({ data }) => {
      if (!data.email) {
        throw new StatusError('No facebook email.', 500);
      }

      return data.email;
    })
    .catch((error) => {
      logger.error(
        `Cannot make Facebook request to get email:\n${error instanceof Error && error.stack ? error.stack : error}}\n${isAxiosError(error) ? `${error.cause}\n${error.message}\n${JSON.stringify(error.config)}\n${JSON.stringify(error.response)}` : ''}`,
      );

      throw new StatusError('Something went wrong.', 500);
    });
}
