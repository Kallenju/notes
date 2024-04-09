import { Router } from 'express';

import { authentication } from '../../../middlewares/authentication.js';
import { getNotesByUserIdAndFilters } from '../../../services/notes/getNotesByUserIdAndFilters.js';

import { validation } from './validation.js';

const getNotesRouter = Router();

getNotesRouter.get<
  Record<string, never>,
  unknown,
  unknown,
  {
    start: string;
    end?: string;
    titleQuery?: string;
    dates?: '1 month' | '3 month';
    hidden?: 'true' | 'false';
  }
>('/notes', validation, authentication(), async (req, res, next) => {
  try {
    const notes = await getNotesByUserIdAndFilters(
      {
        userId: req.userId!,
        titleQuery: req.query.titleQuery,
        dates: req.query.dates,
        hidden: req.query.hidden ? req.query.hidden === 'true' : undefined,
      },
      Number(req.query.start),
      req.query.end ? Number(req.query.end) : undefined,
    );

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

export { getNotesRouter };
