import jwt from 'jsonwebtoken';

import { StatusError } from '../../../shared/StatusError.js';
import { logger } from '../../logger.js';
import { config } from '../../../shared/config.js';

import { getPEMPublicKey } from '../../googleLogin/getPEMPublicKey.js';
import { verifyToken as verifyGoogleAuthCSRFToken } from '../googleCredentialsCSRFToken/verifyToken.js';

export async function verifyAndParseToken(token: string): Promise<{
  userId: string;
  email: string;
  emailVerified: boolean;
}> {
  let decodedToken: jwt.Jwt | null = null;

  try {
    decodedToken = jwt.decode(token, { complete: true });
  } catch (error) {
    logger.error(
      `Cannot decode Google credentials=${token}:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Google credentials is wrong.', 401);
  }

  if (
    !decodedToken ||
    !decodedToken.header.kid ||
    typeof decodedToken.payload === 'string' ||
    typeof decodedToken.payload.sub !== 'string' ||
    typeof decodedToken.payload.email !== 'string' ||
    typeof decodedToken.payload.nonce !== 'string' ||
    typeof decodedToken.payload.email_verified !== 'boolean' ||
    decodedToken.payload.aud !== config.GOOGLE_CLIENT_ID ||
    (decodedToken.payload.iss !== 'accounts.google.com' &&
      decodedToken.payload.iss !== 'https://accounts.google.com') ||
    !decodedToken.payload.exp
  ) {
    logger.error(
      `Google credentials is wrong: ${JSON.stringify(decodedToken?.payload)}.`,
    );

    throw new StatusError('Please re-login.', 401);
  }

  verifyGoogleAuthCSRFToken(decodedToken.payload.nonce);

  const publicKey = await getPEMPublicKey(decodedToken.header.kid);

  try {
    jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      complete: true,
      ignoreExpiration: false,
    });
  } catch (error) {
    logger.error(
      `Cannot verify Google credentials:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    throw new StatusError('Please re-login.', 401);
  }

  return {
    userId: decodedToken.payload.sub,
    email: decodedToken.payload.email,
    emailVerified: decodedToken.payload.email_verified,
  };
}
