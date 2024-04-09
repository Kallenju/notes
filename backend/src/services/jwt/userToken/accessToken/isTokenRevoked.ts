import type { PoolClient } from 'pg';

import { db } from '../../../../database.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { logger } from '../../../logger.js';

export async function isTokenRevoked(
  tokenUUID: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{ id: string; revoked: boolean }>(
    `
      SELECT id,
        revoked
      FROM access_tokens
      WHERE id = $1
    `,
    [tokenUUID],
  );

  if (!result.rowCount) {
    logger.error(`User access token does not exists tokenUUID=${tokenUUID}`);

    throw new StatusError('Your credentials are wrong. Please re-login.', 401);
  }

  return result.rows[0].revoked;
}
