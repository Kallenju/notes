import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function doesFacebookUserExists(
  facebookUserId: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  return Boolean(
    (
      await clientForQuery.query<{ token: string }>(
        `
          SELECT 1
          FROM facebook_login
          WHERE user_id = $1
        `,
        [facebookUserId],
      )
    ).rowCount,
  );
}
