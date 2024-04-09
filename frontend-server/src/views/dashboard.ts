import { Router } from 'express';

import { setView } from '../middlewares/setView.js';

import { getUnparsedAccessTokenCookie } from '../services/cookie/getUnparsedAccessTokenCookie.js';
import { verifyUserAcessToken } from '../services/jwt/user/verifyUserAcessToken.js';

const dashboardViewRouter = Router();

dashboardViewRouter.get(
  '/dashboard',
  setView('dashboard'),
  async (req, res, next) => {
    try {
      const unparsedAccessTokenCookie = getUnparsedAccessTokenCookie(
        req.cookies,
      );

      if (unparsedAccessTokenCookie === null) {
        res.location('/').status(303).send();

        return;
      }

      const result = await verifyUserAcessToken(unparsedAccessTokenCookie);

      if (!result.tokenIsValid) {
        res.location('/').status(303).send();

        return;
      }

      req.userEmail = result.email;

      next();
    } catch (error) {
      next(error);
    }
  },
  (req, res) => {
    res.render('dashboard', { userEmail: req.userEmail });
  },
);

export { dashboardViewRouter };
