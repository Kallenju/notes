import type { PoolClient } from 'pg';
import jwt from 'jsonwebtoken';

import { logger } from '../../../logger.js';
import { StatusError } from '../../../../shared/StatusError.js';
import { db } from '../../../../database.js';
import { config } from '../../../../shared/config.js';

import type { TLoginTypes } from './types.js';

export async function createToken(
  userId: string,
  loginType: TLoginTypes,
  client?: PoolClient,
): Promise<string> {
  let clientForTransaction: PoolClient | null = null;

  try {
    const insideAnotherTransaction = Boolean(client);

    clientForTransaction = insideAnotherTransaction
      ? client!
      : await db.connect();

    if (!insideAnotherTransaction) {
      await clientForTransaction.query(
        'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ',
      );
    }

    const {
      rows: [{ id: accessTokenUUID }],
    } = await clientForTransaction.query<{ id: string }>(
      `
        INSERT INTO access_tokens (user_id)
        VALUES ($1)
        RETURNING id
      `,
      [userId],
    );

    return jwt.sign(
      {
        tokenUUID: accessTokenUUID,
        sub: userId,
        loginType,
        scope: 'user',
      },
      config.ACCESS_TOKEN_JWT_SECRET,
      {
        algorithm: config.ACCESS_TOKEN_JWT_ALGORITHM,
        expiresIn: config.ACCESS_TOKEN_JWT_TOKEN_LIFE_TIME,
        header: {
          alg: config.ACCESS_TOKEN_JWT_ALGORITHM,
          typ: 'JWT',
        },
      },
    );
  } catch (error) {
    if (!client) {
      await clientForTransaction?.query('ROLLBACK');
    }

    logger.error(
      `Cannot create user access token:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Something went wrong.', 500);
  } finally {
    if (!client) {
      clientForTransaction?.release();
    }
  }
}
