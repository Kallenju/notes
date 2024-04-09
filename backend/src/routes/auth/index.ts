import { Router } from 'express';

import { signUpRouter } from './signUp/index.js';
import { loginRouter } from './login/index.js';
import { verifyUserAccessTokenRouter } from '../auth/verifyUserAccessToken/index.js';
import { logoutRouter } from './logout.js';

const authRouter = Router();

authRouter.use(
  '/auth',
  signUpRouter,
  loginRouter,
  logoutRouter,
  verifyUserAccessTokenRouter,
);

export { authRouter };
