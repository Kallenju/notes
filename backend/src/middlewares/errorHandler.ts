import type { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';

import { StatusError } from '../shared/StatusError.js';
import { logger } from '../services/logger.js';

export function errorHandler(): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error: unknown, _req, res, next) => {
    logger.error(
      `${error instanceof Error && error.stack ? error.stack : error}`,
    );

    if (error instanceof StatusError) {
      res.status(error.code).send(error.message);
    } else if (isCelebrateError(error)) {
      const validationMessages = [...error.details.values()].flatMap(
        (validationError) =>
          validationError.details.map(
            (validationErrorItem) => validationErrorItem.message,
          ),
      );

      res.status(400).send(validationMessages.join('\n'));
    } else {
      res.status(500).send('Unexpected error');
    }
  };
}
