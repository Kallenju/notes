import { StatusError } from '../../../shared/StatusError.js';
import { backend } from '../../backend.js';
import { logger } from '../../logger.js';

export async function verifyUserAcessToken(
  unparsedAccessTokenCookie: string,
): Promise<{ tokenIsValid: false } | { tokenIsValid: true; email: string }> {
  try {
    const result = await backend
      .getAxiosInstance()
      .post<{ tokenIsValid: false } | { tokenIsValid: true; email: string }>(
        '/api/auth/verify-access-token',
        { unparsedAccessTokenCookie },
        {
          validateStatus(status) {
            return status === 200;
          },
        },
      )
      .then((response) => response.data);

    return result;
  } catch (error) {
    logger.error(
      `${error instanceof Error && error.stack ? error.stack : error}`,
    );

    throw new StatusError('Something went wrong.', 500);
  }
}
