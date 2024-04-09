import { Router } from 'express';

import { revokeAccessToken } from '../../services/jwt/userToken/accessToken/revokeAccessToken.js';
import { getAccessTokenFromCookies } from '../../services/cookie/userToken/accessToken/getAccessTokenFromCookies.js';
import { accessTokenCookieName } from '../../services/cookie/userToken/accessToken/types.js';

const logoutRouter = Router();

logoutRouter.post('/logout', async (req, res, next) => {
  try {
    await revokeAccessToken(getAccessTokenFromCookies(req.signedCookies));

    res.clearCookie(accessTokenCookieName).location('/').status(204).send();
  } catch (error) {
    next(error);
  }
});

export { logoutRouter };
