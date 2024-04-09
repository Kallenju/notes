import { Router } from 'express';

import { setView } from '../middlewares/setView.js';

import { getUnparsedAccessTokenCookie } from '../services/cookie/getUnparsedAccessTokenCookie.js';
import { verifyUserAcessToken } from '../services/jwt/user/verifyUserAcessToken.js';

const mainViewRouter = Router();

mainViewRouter.get(
  '/',
  setView('index'),
  async (req, res, next) => {
    try {
      const unparsedAccessTokenCookie = getUnparsedAccessTokenCookie(
        req.cookies,
      );

      if (unparsedAccessTokenCookie === null) {
        next();

        return;
      }

      const result = await verifyUserAcessToken(unparsedAccessTokenCookie);

      if (!result.tokenIsValid) {
        next();

        return;
      }

      res.location('/dashboard').status(303).send();
    } catch (error) {
      next(error);
    }
  },
  (_req, res) => {
    res.render('index');
  },
);

export { mainViewRouter };
