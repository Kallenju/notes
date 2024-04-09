import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function doesGoogleUserExists(
  googleUserId: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  return Boolean(
    (
      await clientForQuery.query<{ token: string }>(
        `
          SELECT 1
          FROM google_auth
          WHERE user_id = $1
        `,
        [googleUserId],
      )
    ).rowCount,
  );
}
