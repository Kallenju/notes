import type { PoolClient } from 'pg';

import jwt from 'jsonwebtoken';

import { db } from '../../../../database.js';
import type { TMicroserviceNames } from '../types.ts';
import { config } from '../../../../shared/config.js';

export async function createToken(
  microserviceName: TMicroserviceNames,
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
      rows: [{ id: microserviceTokenUUID }],
    } = await clientForTransaction.query<{ id: string }>(
      `
        INSERT INTO microservice_access_tokens(microservice_name)
        VALUES ($1)
        RETURNING id
      `,
      [microserviceName],
    );

    const token = jwt.sign(
      {
        tokenUUID: microserviceTokenUUID,
        sub: microserviceName,
        scope: 'microservice',
      },
      config.MICROSERVICE_TOKEN_JWT_SECRET,
      {
        algorithm: config.MICROSERVICE_TOKEN_JWT_ALGORITHM,
        expiresIn: config.MICROSERVICE_TOKEN_JWT_TOKEN_LIFE_TIME,
        header: {
          alg: config.MICROSERVICE_TOKEN_JWT_ALGORITHM,
          typ: 'JWT',
        },
      },
    );

    if (!insideAnotherTransaction) {
      await clientForTransaction.query('COMMIT');
    }

    return token;
  } catch (error) {
    if (!client) {
      await clientForTransaction?.query('ROLLBACK');
    }

    throw error;
  } finally {
    if (!client) {
      clientForTransaction?.release();
    }
  }
}
