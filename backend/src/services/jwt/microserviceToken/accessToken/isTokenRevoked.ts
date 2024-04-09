import type { PoolClient } from 'pg';

import { StatusError } from '../../../../shared/StatusError.js';
import { logger } from '../../../logger.js';
import { db } from '../../../../database.js';

export async function isTokenRevoked(
  tokenUUID: string,
  client?: PoolClient,
): Promise<boolean> {
  const clientForQuery = client || db;

  const result = await clientForQuery.query<{ id: string; revoked: boolean }>(
    `
      SELECT id,
        revoked
      FROM microservice_access_tokens
      WHERE id = $1
    `,
    [tokenUUID],
  );

  if (!result.rowCount) {
    logger.error(
      `Microservice access token does not exists tokenUUID=${tokenUUID}`,
    );

    throw new StatusError('Microservice access token is wrong.', 401);
  }

  return result.rows[0].revoked;
}
