import express from 'express';
import type { Server } from 'http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { errorHandler } from './middlewares/errorHandler.js';
import { logging } from './middlewares/logging.js';

import { config } from './shared/config.js';

import { authRouter } from './routes/auth/index.js';
import { notesRouter } from './routes/notes/index.js';
import { microservicesRouter } from './routes/microservices/index.js';
import { facebookRouter } from './routes/facebook/index.js';
import { googleRouter } from './routes/google/index.js';
import { healthcheckRouter } from './routes/healthcheck/index.js';
import { pingRouter } from './routes/ping.js';
import { logger } from './services/logger.js';

const app = express();

let server: Server | undefined;

export function startServer(): void {
  app.disable('x-powered-by');

  app.use(logging());

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: 'self',
          connectSrc: [
            "'self'",
            'https://cdn.jsdelivr.net/codemirror.spell-checker/',
            'https://accounts.google.com/gsi/',
            'https://*.facebook.com/platform/',
            'https://*.facebook.com/v19.0/',
          ],
          baseUri: 'self',
          fontSrc: [
            "'self'",
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/',
            'https://maxcdn.bootstrapcdn.com/font-awesome/latest/',
          ],
          formAction: config.NODE_ENV === 'production' ? 'self' : null,
          frameAncestors: 'self',
          frameSrc: ['https://accounts.google.com/'],
          imgSrc: [
            "'self'",
            'data:',
            'https://www.gravatar.com/avatar/',
            'https://*.facebook.com/platform/',
          ],
          objectSrc: 'none',
          scriptSrc: [
            "'self'",
            'https://accounts.google.com/gsi/',
            'https://connect.facebook.net/',
          ],
          scriptSrcAttr: 'none',
          styleSrc: [
            "'self'",
            'https://cdn.jsdelivr.net/npm/uikit@3.5.9/dist/css/uikit.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/',
            'https://maxcdn.bootstrapcdn.com/font-awesome/latest/',
            'https://unpkg.com/easymde/',
            'https://accounts.google.com/gsi/',
            "'unsafe-inline'",
          ],
        },
      },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginEmbedderPolicy: { policy: 'credentialless' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      originAgentCluster: true,
      referrerPolicy: {
        policy:
          config.NODE_ENV === 'production'
            ? 'strict-origin-when-cross-origin'
            : 'no-referrer-when-downgrade',
      },
      strictTransportSecurity:
        config.NODE_ENV === 'production'
          ? {
              maxAge: 15552000,
              includeSubDomains: true,
            }
          : false,
      xContentTypeOptions: true,
      xDnsPrefetchControl: false,
      xDownloadOptions: false,
      xFrameOptions: false,
      xPermittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },
      xPoweredBy: false,
      xXssProtection: false,
    }),
  );

  app.use(cookieParser(config.COOKIE_SECRET));

  app.set('trust proxy', 1); // trust first proxy

  app.use(
    '/api',
    authRouter,
    notesRouter,
    microservicesRouter,
    googleRouter,
    facebookRouter,
    healthcheckRouter,
    pingRouter,
  );

  app.use(errorHandler());

  app.all('*', (_req, res) => {
    res.status(404).send('Resource does not exist');
  });

  const hostname = '0.0.0.0';
  const port = Number(config.PORT);

  server = app.listen(port, hostname, () => {
    logger.info('Start Server');
    logger.info(`Listening on http://${hostname}:${port}`);
  });

  server.keepAliveTimeout = 60 * 1000 + 1000;
  server.headersTimeout = 60 * 1000 + 2000;
}

export { server };
