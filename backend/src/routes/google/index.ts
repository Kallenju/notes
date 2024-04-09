import { Router } from 'express';

import { issueCSRFTokenRouter } from './issueCSRFToken.js';
import { signInRouter } from './signIn/index.js';

const googleRouter = Router();

googleRouter.use('/google', signInRouter, issueCSRFTokenRouter);

export { googleRouter };
