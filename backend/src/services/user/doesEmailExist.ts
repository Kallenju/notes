import type { PoolClient } from 'pg';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';

import { db } from '../../database.js';

export async function doesEmailExist(
  email: string,
  client?: PoolClient,
): Promise<{
  userId: string | null;
  userEmail: boolean;
  googleEmail: boolean;
  facebookEmail: boolean;
}> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{
    user_id: string | null;
    user_email: string | null;
    google_email: string | null;
    facebook_email: string | null;
  }>(
    `
      SELECT users.id as user_id,
        users.email as user_email,
        google_auth.email as google_email,
        facebook_login.email as facebook_email
      FROM users
        LEFT JOIN facebook_login ON users.facebook_user_id = facebook_login.user_id
        LEFT JOIN google_auth ON users.google_user_id = google_auth.user_id
      WHERE users.email = $1
        OR google_auth.email = $1
        OR facebook_login.email = $1
    `,
    [email],
  );

  if (result.rowCount && result.rowCount >= 2) {
    logger.error(
      `Several users has the same associated emails:\nemail=${email}\nuser#1=${result.rows[0]?.user_id}\nuser#2=${result.rows[1]?.user_id}`,
    );

    throw new StatusError('Something went wrong.', 500);
  }

  return {
    userId: result.rows[0]?.user_id || null,
    userEmail: Boolean(result.rows[0]?.user_email),
    googleEmail: Boolean(result.rows[0]?.google_email),
    facebookEmail: Boolean(result.rows[0]?.facebook_email),
  };
}
