import { db } from '../../database.js';

import { logger } from '../logger.js';
import { StatusError } from '../../shared/StatusError.js';
import { getPostgreSQLQueryAndParams } from '../../shared/getPostgreSQLQueryAndParams.js';
import type { Note } from '../../typings/note.ts';

export async function updateNote(
  noteId: string,
  data: {
    title?: string;
    text?: string;
    hidden?: boolean;
  },
): Promise<Note> {
  if (
    data.title === undefined &&
    data.text === undefined &&
    data.hidden === undefined
  ) {
    logger.error('At least one property is required for note updating');

    throw new StatusError('Bad request.', 400);
  }

  const { query, params } = getPostgreSQLQueryAndParams(
    `
      UPDATE notes
      SET ${[
        data.title !== undefined ? 'title = $title' : undefined,
        data.text !== undefined ? 'text = $text' : undefined,
        data.hidden !== undefined ? 'hidden = $hidden' : undefined,
        'updated_at = now()',
      ]
        .filter(Boolean)
        .join(',\n  ')}
      WHERE id = $noteId
      RETURNING id,
        title,
        text,
        hidden,
        created_at,
        updated_at
    `,
    {
      $noteId: noteId,
      $title: data.title,
      $text: data.text,
      $hidden: data.hidden,
    },
  );

  const updateQuery = await db.query<{
    id: string;
    title: string | null;
    text: string | null;
    hidden: boolean;
    created_at: Date;
    updated_at: Date;
  }>(query, params);

  if (!updateQuery.rowCount) {
    logger.error('Note does not exist');

    throw new StatusError('Bad request.', 404);
  }

  const updatedNote = updateQuery.rows[0];

  return {
    id: updatedNote.id,
    title: updatedNote.title,
    text: updatedNote.text,
    hidden: updatedNote.hidden,
    createdAt: updatedNote.created_at,
    updatedAt: updatedNote.updated_at,
  };
}
