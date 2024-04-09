import { StatusError } from '../../../shared/StatusError.js';
import { backend } from '../../backend.js';
import { logger } from '../../logger.js';

export async function verifyCSRFToken(
  csrfToken: string,
): Promise<{ tokenIsValid: boolean }> {
  try {
    const result = await backend
      .getAxiosInstance()
      .post<{ tokenIsValid: boolean }>(
        '/api/facebook-login/verify-access-token',
        { csrfToken },
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
