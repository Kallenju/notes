import type { PoolClient } from 'pg';

import { createNote } from './createNote.js';

const DEMO_NOTE_TITLE = 'Demo' as const;
const DEMO_NOTE_TEXT = `
  # It is Demo note
  ## *Try your self*


  1. We
  2. support
  3. many
  4. features
` as const;

export async function createDemoNote(
  userId: string,
  client?: PoolClient,
): Promise<void> {
  await createNote(
    userId,
    {
      title: DEMO_NOTE_TITLE,
      text: DEMO_NOTE_TEXT,
    },
    client,
  );
}
