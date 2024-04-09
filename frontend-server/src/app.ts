import path from 'node:path';
import express from 'express';
import type { Server } from 'http';
import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';
import helmet from 'helmet';

import { errorHandler } from './middlewares/errorHandler.js';

import { BASE_FRONTEND_PATH } from './types.js';
import { config } from './shared/config.js';
import { logger } from './services/logger.js';

import { mainViewRouter } from './views/main.js';
import { dashboardViewRouter } from './views/dashboard.js';
import { errorViewRouter } from './views/error.js';
import { healthcheckRouter } from './routes/healthcheck/index.js';

const app = express();

let server: Server | null = null;

export function startServer(): void {
  app.disable('x-powered-by');

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
            'https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/',
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

  app.use(cookieParser());

  app.set('trust proxy', 1); // trust first proxy

  nunjucks.configure(path.resolve(BASE_FRONTEND_PATH, 'views'), {
    autoescape: true,
    express: app,
    watch: config.NODE_ENV == 'development',
    noCache: config.NODE_ENV == 'development',
  });

  app.set('view engine', 'njk');
  app.set('view cache', config.NODE_ENV == 'production');

  app.use(express.static(path.resolve(BASE_FRONTEND_PATH, 'public')));

  app.use(
    '/',
    mainViewRouter,
    dashboardViewRouter,
    errorViewRouter,
    healthcheckRouter,
  );

  app.use(errorHandler());

  app.all('*', (_req, res) => {
    res.status(303).location('/404').send();
  });

  const hostname = '0.0.0.0';
  const port = Number(config.PORT);

  server = app.listen(port, hostname, () => {
    logger.info('Start Server');
    logger.info(`Listening on http://${hostname}:${port}`);
  });
}

export { server };
