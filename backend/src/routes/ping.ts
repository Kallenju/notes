import { Router } from 'express';

import { pingDatabase } from '../services/db/pingDatabase.js';

const pingRouter = Router();

pingRouter.get('/ping', async (_req, res, next) => {
  try {
    await pingDatabase();

    res.send('pong');
  } catch (error) {
    next(error);
  }
});

export { pingRouter };
