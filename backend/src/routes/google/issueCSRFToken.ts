import { Router } from 'express';

import { createToken } from '../../services/jwt/googleCredentialsCSRFToken/createToken.js';

const issueCSRFTokenRouter = Router();

issueCSRFTokenRouter.post('/issue-csrf-token', (_req, res) => {
  res.status(200).send({ token: createToken() });
});

export { issueCSRFTokenRouter };
