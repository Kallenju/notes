import { Router } from 'express';

import { logger } from '../../../services/logger.js';
import { authentication } from '../../../middlewares/authentication.js';
import { authorization } from '../../../middlewares/authorization.js';
import { getNote } from '../../../services/notes/getNote.js';
import { StatusError } from '../../../shared/StatusError.js';

import { validation } from './validation.js';

const getNoteRouter = Router();

getNoteRouter.get<{ noteId: string }>(
  '/notes/:noteId',
  validation,
  authentication(),
  authorization('notes'),
  async (req, res, next) => {
    try {
      const note = await getNote(req.params.noteId);

      if (!note) {
        logger.info(`Note with id=${req.params.noteId} does not exists`);

        throw new StatusError(`Note with id=${req.params.noteId} does not exis`, 404);
      }

      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  },
);

export { getNoteRouter };
