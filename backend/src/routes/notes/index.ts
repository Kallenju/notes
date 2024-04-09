import { Router } from 'express';

import { createNoteRouter } from './createNote/index.js';
import { getNoteRouter } from './getNote/index.js';
import { getNotesRouter } from './getNotes/index.js';
import { updateNoteRouter } from './updateNote/index.js';
import { deleteNoteRouter } from './deleteNote/index.js';

const notesRouter = Router();

notesRouter.use(
  '/',
  createNoteRouter,
  getNoteRouter,
  getNotesRouter,
  updateNoteRouter,
  deleteNoteRouter,
);

export { notesRouter };
