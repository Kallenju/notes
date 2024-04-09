import type { RequestHandler } from 'express';

import { logger } from '../services/logger.js';
import { StatusError } from '../shared/StatusError.js';
import { db } from '../database.js';

export function authorization(
  resource: 'notes',
): RequestHandler<
  { noteId?: string },
  unknown,
  { id?: string },
  { noteId?: string }
> {
  return async (req, res, next): Promise<void> => {
    try {
      let isAuthorized = false;

      const noteId = req.params.noteId || req.body.id || req.query.noteId;

      if (!noteId) {
        next();

        return;
      }

      switch (resource) {
        case 'notes': {
          isAuthorized = Boolean(
            (
              await db.query(
                `
                SELECT id
                FROM notes
                WHERE id = $1
                  AND user_id = $2
              `,
                [noteId, req.userId!],
              )
            ).rowCount,
          );

          break;
        }
      }

      if (!isAuthorized) {
        logger.info(
          `Attempt of unauthorized access to ${resource} with req.params=${JSON.stringify(req.params)} by user#${req.userId}`,
        );

        throw new StatusError('You cannot access this resource.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
