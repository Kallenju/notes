import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function getUserAuthDataByEmail(
  email: string,
  client?: PoolClient,
): Promise<{ id: string; password: string; salt: string } | null> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{
    id: string;
    password: string;
    salt: string;
  }>(
    `
      SELECT auth.user_id as id,
        auth.password,
        auth.salt
      FROM auth
        LEFT JOIN users on auth.user_id = users.id
      WHERE users.email = $1
    `,
    [email],
  );

  if (!result.rowCount) {
    return null;
  }

  return result.rows[0];
}
