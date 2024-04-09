import { Router } from 'express';

import { pingDatabase } from '../../services/db/pingDatabase.js';

const healthcheckRouter = Router();

healthcheckRouter.get('/healthcheck', async (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    await pingDatabase();

    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.message = String(error);

    res.status(503).send(healthcheck);
  }
});

export { healthcheckRouter };
