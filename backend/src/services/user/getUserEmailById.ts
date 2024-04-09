import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function getUserEmailById(
  userId: string,
  client?: PoolClient,
): Promise<{
  userEmail: string | null;
  googleEmail: string | null;
  facebookEmail: string | null;
}> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{
    user_email: string | null;
    google_email: string | null;
    facebook_email: string | null;
  }>(
    `
      SELECT users.email as user_email,
        google_auth.email as google_email,
        facebook_login.email as facebook_email
      FROM users
        LEFT JOIN facebook_login ON users.facebook_user_id = facebook_login.user_id
        LEFT JOIN google_auth ON users.google_user_id = google_auth.user_id
      WHERE id = $1
    `,
    [userId],
  );

  return {
    userEmail: result.rows[0]?.user_email || null,
    googleEmail: result.rows[0]?.google_email || null,
    facebookEmail: result.rows[0]?.facebook_email || null,
  };
}
