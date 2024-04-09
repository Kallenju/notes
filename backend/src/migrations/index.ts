import type { PoolClient } from 'pg';

import { initMigration } from './1703937686690-init.js';

const migrations = new Map<string, string>([
  ['1703937686690-init', initMigration],
]);

export async function runMigrations(client: PoolClient): Promise<void> {
  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name text NOT NULL
      )
    `);

    await Promise.all(
      [...migrations.entries()].map(async ([migrationName, migration]) => {
        const migrationWasApplied = Boolean(
          (
            await client.query<{ name: string }>(
              `
            SELECT name
            FROM migrations
            WHERE name = $1
          `,
              [migrationName],
            )
          ).rowCount,
        );

        if (migrationWasApplied) {
          return;
        }

        await Promise.all([
          client.query(
            `
            INSERT INTO migrations(name)
            VALUES ($1)
          `,
            [migrationName],
          ),
          client.query(migration),
        ]);
      }),
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');

    throw err;
  } finally {
    client.release();
  }
}
