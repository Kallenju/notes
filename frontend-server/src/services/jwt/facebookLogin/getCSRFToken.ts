import { StatusError } from '../../../shared/StatusError.js';
import { backend } from '../../backend.js';
import { logger } from '../../logger.js';

export async function getCSRFToken(): Promise<{ token: string }> {
  try {
    const result = await backend
      .getAxiosInstance()
      .post<{ token: string }>(
        '/api/facebook-login/issue-csrf-token',
        undefined,
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
