import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { db } from '../../database.js';

export async function getUserByFacebookUserId(
  facebookUserId: string,
  client?: PoolClient,
): Promise<{ userId: string; facebookEmail: string }> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{
    id: string;
    facebook_email: string;
  }>(
    `
      SELECT users.id,
        facebook_login.email AS facebook_email
      FROM facebook_login
        LEFT JOIN users ON facebook_login.user_id = users.facebook_user_id
      WHERE facebook_login.user_id = $1
    `,
    [facebookUserId],
  );

  if (!result.rowCount) {
    logger.error('Cannot find user with');

    throw new StatusError('Something went wrong.', 500);
  }

  return {
    userId: result.rows[0].id,
    facebookEmail: result.rows[0].facebook_email,
  };
}
