import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { getUserByFacebookUserId } from './getUserByFacebookUserId.js';
import { doesEmailExist } from '../user/doesEmailExist.js';

export async function updateUser(
  facebookUserId: string,
  email: string,
  client: PoolClient,
): Promise<void> {
  const emailExists = await doesEmailExist(email, client);

  if (emailExists.facebookEmail) {
    logger.error('Cannot update Facebook email, because it already exists.');

    throw new StatusError('Something went wrong.', 500);
  }

  if (emailExists.userEmail || emailExists.googleEmail) {
    const user = await getUserByFacebookUserId(facebookUserId, client);

    if (emailExists.userId !== user.userId) {
      logger.error(
        `Cannot update Facebook email, because it is associated with another account:\ncurrent userId=${user.userId}\nanother account id=${emailExists.userId}`,
      );

      throw new StatusError('Wrong request.', 400);
    }
  }

  await client.query(
    `
      UPDATE facebook_login
      SET email = $1
      WHERE user_id = $2
    `,
    [email, facebookUserId],
  );
}
