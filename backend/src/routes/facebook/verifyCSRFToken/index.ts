import { Router, json } from 'express';

import { StatusError } from '../../../shared/StatusError.js';
import { logger } from '../../../services/logger.js';

import { verifyToken } from '../../../services/jwt/facebookLoginCSRFToken/verifyToken.js';

const verifyCSRFTokenRouter = Router();

verifyCSRFTokenRouter.use(json());

verifyCSRFTokenRouter.post<
  Record<string, never>,
  { tokenIsValid: boolean },
  { csrfToken: string }
>('/verify-csrf-token', (req, res, next) => {
  try {
    verifyToken(req.body.csrfToken);

    res.status(200).send({ tokenIsValid: true });
  } catch (error) {
    if (error instanceof StatusError && error.code === 401) {
      res.status(200).send({ tokenIsValid: false });

      return;
    }

    logger.error(
      `Cannot verify Facebook login CRSF token::\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    next(error);
  }
});

export { verifyCSRFTokenRouter };
