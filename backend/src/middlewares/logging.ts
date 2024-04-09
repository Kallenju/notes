import type { RequestHandler } from 'express';

import { config } from '../shared/config.js';
import { logger } from '../services/logger.js';

export function logging(): RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (req, _res, next) => {
    if (config.NODE_ENV !== 'development') {
      next();

      return;
    }

    if (req.url.includes('healthcheck') || req.url.includes('ping')) {
      next();

      return;
    }

    logger.info(
      JSON.stringify({
        url: req.url,
        method: req.method,
        query: req.query,
        headers: req.headers,
        body: req.body,
        params: req.params,
      }),
    );

    next();
  };
}
