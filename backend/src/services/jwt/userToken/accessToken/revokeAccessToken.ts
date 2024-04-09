import type { PoolClient } from 'pg';

import { db } from '../../../../database.js';

export async function revokeAccessToken(
  accessTokenUUID: string,
  client?: PoolClient,
): Promise<void> {
  const clientForQuery = client || db;

  await clientForQuery.query(
    `
      UPDATE access_tokens
      SET revoked = true
      WHERE id = $1
    `,
    [accessTokenUUID],
  );
}
