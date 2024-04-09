import { db } from '../../database.js';
import type { Note } from '../../typings/note.ts';
import { getPostgreSQLQueryAndParams } from '../../shared/getPostgreSQLQueryAndParams.js';
import { calculateOffsetAndLimit } from '../../shared/calculateOffsetAndLimit.js';
import { getNotesTotalByUserIdAndFilters } from './getNotesTotalByUserIdAndFilters.js';

export async function getNotesByUserIdAndFilters(
  request: {
    userId: string;
    titleQuery?: string;
    dates?: '1 month' | '3 month';
    hidden?: boolean;
  },
  start: number,
  end?: number,
): Promise<{ total: number; notes: Note[] }> {
  const total = await getNotesTotalByUserIdAndFilters(request);

  if (total === 0) {
    return {
      total,
      notes: [],
    };
  }

  const offsetAndLimit = calculateOffsetAndLimit(total, start, end);

  if (!offsetAndLimit) {
    return {
      total,
      notes: [],
    };
  }

  const { query, params } = getPostgreSQLQueryAndParams(
    [
      'user_id = $userId',
      request.dates !== undefined
        ? 'created_at > CURRENT_TIMESTAMP - $dates::interval'
        : undefined,
      request.hidden !== undefined ? 'hidden = $hidden' : undefined,
      request.titleQuery !== undefined ? 'title % $titleQuery' : undefined,
    ]
      .filter(Boolean)
      .join(' AND\n  '),
    {
      $userId: request.userId,
      $dates: request.dates,
      $hidden: request.hidden,
      $titleQuery: request.titleQuery,
    },
  );

  const result = await db.query<{
    id: string;
    title: string | null;
    text: string | null;
    hidden: boolean;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      SELECT id,
        title,
        text,
        hidden,
        created_at,
        updated_at
      FROM notes
      WHERE ${query}
      ORDER BY created_at DESC
      ${
        offsetAndLimit
          ? `LIMIT ${offsetAndLimit.limit} OFFSET ${offsetAndLimit.offset}`
          : ''
      }
    `,
    params,
  );

  return {
    total,
    notes: result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.text,
      hidden: row.hidden,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })),
  };
}
