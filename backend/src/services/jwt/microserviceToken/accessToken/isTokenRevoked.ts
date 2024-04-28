import type { PoolClient } from 'pg';

import { db } from '../../../../database.js';

export async function isTokenRevoked(
  tokenUUID: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query(
    `
      SELECT 1
      FROM microservice_access_tokens
      WHERE id = $1
        AND revoked IS TRUE
    `,
    [tokenUUID],
  );

  return Boolean(result.rowCount);
}
