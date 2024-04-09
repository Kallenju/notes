import { Router } from 'express';

import { microserviceAuthentication } from '../../middlewares/microserviceAuthentication.js';

import { createToken } from '../../services/jwt/microserviceToken/accessToken/createToken.js';

const issueMicroserviceTokenRouter = Router();

issueMicroserviceTokenRouter.post(
  '/issue-access-token',
  microserviceAuthentication('authToken'),
  async (req, res, next) => {
    try {
      res.status(200).send({ token: await createToken(req.microservice!) });
    } catch (error) {
      next(error);
    }
  },
);

export { issueMicroserviceTokenRouter };
