import { Router, json } from 'express';

import { authentication } from '../../../middlewares/authentication.js';
import { authorization } from '../../../middlewares/authorization.js';
import { updateNote } from '../../../services/notes/updateNote.js';

import { validation } from './validation.js';

const updateNoteRouter = Router();

updateNoteRouter.use(json());

updateNoteRouter.patch<
  Record<string, never>,
  unknown,
  { id: string; title?: string; text?: string; hidden?: boolean }
>(
  '/notes',
  validation,
  authentication(),
  authorization('notes'),
  async (req, res, next) => {
    try {
      const updatedNote = await updateNote(req.body.id, req.body);

      res.status(200).location(`/notes/${updatedNote.id}`).send(updatedNote);
    } catch (error) {
      next(error);
    }
  },
);

export { updateNoteRouter };
