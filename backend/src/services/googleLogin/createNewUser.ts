import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { doesEmailExist } from '../user/doesEmailExist.js';

export async function createNewUser(
  googleUserId: string,
  email: string,
  client: PoolClient,
): Promise<string> {
  const emailExists = await doesEmailExist(email, client);

  if (emailExists.googleEmail) {
    logger.error(
      `Cannot create Google user, because email=${email} already exists.`,
    );

    throw new StatusError('Something went wrong.', 500);
  }

  await client.query(
    `
      INSERT INTO google_auth (user_id, email)
      VALUES ($1, $2)
    `,
    [googleUserId, email],
  );

  let userId: string | null = null;

  if (!emailExists.userEmail && !emailExists.facebookEmail) {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO users (google_user_id)
        VALUES ($1)
        RETURNING id
      `,
      [googleUserId],
    );

    userId = result.rows[0].id;
  } else {
    if (!emailExists.userId) {
      logger.error(
        `Cannot create Google user, because emailExists.userId does not exists.`,
      );

      throw new StatusError('Something went wrong.', 500);
    }

    await client.query(
      `
        UPDATE users
        SET google_user_id = $1
        WHERE id = $2
      `,
      [googleUserId, emailExists.userId],
    );

    userId = emailExists.userId;
  }

  await doesEmailExist(email, client);

  return userId;
}
