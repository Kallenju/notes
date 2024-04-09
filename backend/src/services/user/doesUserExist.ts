import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function doesUserExist(
  userId: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  return Boolean(
    (
      await clientForQuery.query<{ token: string }>(
        `
          SELECT 1
          FROM users
          WHERE id = $1
        `,
        [userId],
      )
    ).rowCount,
  );
}
