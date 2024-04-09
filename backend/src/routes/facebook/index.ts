import { Router } from 'express';

import { issueCSRFTokenRouter } from './issueCSRFToken.js';
import { signInRouter } from './signIn/index.js';
import { verifyCSRFTokenRouter } from './verifyCSRFToken/index.js';

const facebookRouter = Router();

facebookRouter.use(
  '/facebook',
  signInRouter,
  issueCSRFTokenRouter,
  verifyCSRFTokenRouter,
);

export { facebookRouter };
