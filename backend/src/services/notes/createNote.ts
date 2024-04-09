import type { PoolClient } from 'pg';

import { db } from '../../database.js';

export async function createNote(
  userId: string,
  {
    title,
    text,
  }: {
    title?: string;
    text?: string;
  },
  client?: PoolClient,
): Promise<string> {
  const clientForQuery = client || db;

  return (
    await clientForQuery.query<{ id: string }>(
      `
        INSERT INTO notes (title, text, user_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [title, text, userId],
    )
  ).rows[0].id;
}
