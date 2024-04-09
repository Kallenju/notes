import { Router, json } from 'express';

import { authentication } from '../../../middlewares/authentication.js';
import { createNote } from '../../../services/notes/createNote.js';

import { validation } from './validation.js';

const createNoteRouter = Router();

createNoteRouter.use(json());

createNoteRouter.post<
  Record<string, never>,
  unknown,
  { title?: string; text?: string }
>('/notes', validation, authentication(), async (req, res, next) => {
  try {
    const id = await createNote(req.userId!, {
      title: req.body.title,
      text: req.body.text,
    });

    res.status(201).location(`/notes/${id}`).json({ id });
  } catch (error) {
    next(error);
  }
});

export { createNoteRouter };
