import { Router } from 'express';

const errorViewRouter = Router();

errorViewRouter.all('/404', (_req, res) => {
  res.render('error', { error: 'The resource does not exist' });
});

export { errorViewRouter };
