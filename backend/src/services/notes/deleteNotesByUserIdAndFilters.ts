import { db } from '../../database.js';

import { StatusError } from '../../shared/StatusError.js';
import { getPostgreSQLQueryAndParams } from '../../shared/getPostgreSQLQueryAndParams.js';
import { logger } from '../logger.js';

export async function deleteNotesByUserIdAndFilters(request: {
  userId: string;
  noteId?: string;
  hidden?: boolean;
}): Promise<void> {
  if (request.noteId === undefined && request.hidden === undefined) {
    logger.error('At least one property is required for note updating');

    throw new StatusError('Bad request.', 400);
  }

  const { query, params } = getPostgreSQLQueryAndParams(
    [
      'user_id = $userId',
      request.noteId !== undefined ? 'id = $noteId' : undefined,
      request.hidden !== undefined ? 'hidden = $hidden' : undefined,
    ]
      .filter(Boolean)
      .join(' AND\n  '),
    {
      $userId: request.userId,
      $noteId: request.noteId,
      $hidden: request.hidden,
    },
  );

  await db.query(
    `
      DELETE FROM notes
      WHERE ${query}
    `,
    params,
  );
}
