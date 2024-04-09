import { Router } from 'express';

import { authentication } from '../../../middlewares/authentication.js';
import { authorization } from '../../../middlewares/authorization.js';
import { deleteNotesByUserIdAndFilters } from '../../../services/notes/deleteNotesByUserIdAndFilters.js';

import { validation } from './validation.js';

const deleteNoteRouter = Router();

deleteNoteRouter.delete<
  Record<string, never>,
  unknown,
  Record<string, never>,
  {
    noteId?: string;
    hidden?: 'true' | 'false';
  }
>(
  '/notes',
  validation,
  authentication(),
  authorization('notes'),
  async (req, res, next) => {
    try {
      await deleteNotesByUserIdAndFilters({
        userId: req.userId!,
        noteId: req.query.noteId,
        hidden: req.query.hidden ? req.query.hidden === 'true' : undefined,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export { deleteNoteRouter };
