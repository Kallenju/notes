import type { ErrorRequestHandler } from 'express';

import { logger } from '../services/logger.js';
import { StatusError } from '../shared/StatusError.js';

export function errorHandler(): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error: unknown, req, res, next) => {
    logger.error(
      `${error instanceof Error && error.stack ? error.stack : error}`,
    );

    res.render('error', {
      error:
        error instanceof StatusError ? error.message : 'Something went wrong.',
    });
  };
}
