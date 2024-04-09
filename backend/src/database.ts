import type { Pool } from 'pg';
import pg from 'pg';

import { runMigrations } from './migrations/index.js';
import { config } from './shared/config.js';
import { logger } from './services/logger.js';

let db: Pool;

export async function initDB(): Promise<void> {
  db = new pg.Pool({
    user: config.PGUSER,
    password: config.PGPASSWORD,
    host: config.PGHOST,
    database: config.PGDATABASE,
    port: Number(config.PGPORT),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 95,
  });

  await runMigrations(await db.connect());

  logger.info('Init DB');
}

export { db };
