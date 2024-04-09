import { Router } from 'express';

const healthcheckRouter = Router();

healthcheckRouter.get('/healthcheck', async (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.message = String(error);

    res.status(503).send(healthcheck);
  }
});

export { healthcheckRouter };
