import { db } from '../../database.js';

import { getPostgreSQLQueryAndParams } from '../../shared/getPostgreSQLQueryAndParams.js';

export async function getNotesTotalByUserIdAndFilters(request: {
  userId: string;
  dates?: '1 month' | '3 month';
  titleQuery?: string;
  hidden?: boolean;
}): Promise<number> {
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
    notes_total: number;
  }>(
    `
      SELECT COUNT(*) AS notes_total
      FROM notes
      WHERE ${query}
    `,
    params,
  );

  return result.rows[0].notes_total;
}
