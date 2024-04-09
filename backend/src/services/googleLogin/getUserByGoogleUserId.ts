import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { db } from '../../database.js';

export async function getUserByGoogleUserId(
  googleUserId: string,
  client?: PoolClient,
): Promise<{ userId: string }> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{
    id: string;
  }>(
    `
      SELECT users.id
      FROM google_auth
        LEFT JOIN users ON google_auth.user_id = users.google_user_id
      WHERE google_auth.user_id = $1
    `,
    [googleUserId],
  );

  if (!result.rowCount) {
    logger.error('Cannot find user with');

    throw new StatusError('Something went wrong.', 500);
  }

  return {
    userId: result.rows[0].id,
  };
}
