import { db } from '../../database.js';
import type { Note } from '../../typings/note.ts';

export async function getNote(noteId: string): Promise<Note | null> {
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
      WHERE id = $1
    `,
    [noteId],
  );

  if (!result.rowCount) {
    return null;
  }

  const note = result.rows[0];

  return {
    id: note.id,
    title: note.title,
    text: note.text,
    hidden: note.hidden,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}
