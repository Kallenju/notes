import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { doesEmailExist } from '../user/doesEmailExist.js';

export async function createNewUser(
  facebookUserId: string,
  email: string,
  client: PoolClient,
): Promise<string> {
  const emailExists = await doesEmailExist(email, client);

  if (emailExists.facebookEmail) {
    logger.error(
      `Cannot create Facebook user, because email=${email} already exists.`,
    );

    throw new StatusError('Something went wrong.', 500);
  }

  await client.query(
    `
      INSERT INTO facebook_login (user_id, email)
      VALUES ($1, $2)
    `,
    [facebookUserId, email],
  );

  let userId: string | null = null;

  if (!emailExists.userEmail && !emailExists.googleEmail) {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO users (facebook_user_id)
        VALUES ($1)
        RETURNING id
      `,
      [facebookUserId],
    );

    userId = result.rows[0].id;
  } else {
    if (!emailExists.userId) {
      logger.error(
        `Cannot create Facebook user, because emailExists.userId does not exists.`,
      );

      throw new StatusError('Something went wrong.', 500);
    }

    await client.query(
      `
        UPDATE users
        SET facebook_user_id = $1
        WHERE id = $2
      `,
      [facebookUserId, emailExists.userId],
    );

    userId = emailExists.userId;
  }

  await doesEmailExist(email, client);

  return userId;
}
