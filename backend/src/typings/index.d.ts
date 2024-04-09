/* eslint-disable @typescript-eslint/no-empty-interface */
import type { TMicroserviceNames } from '../shared/constants';

interface Params {
  userId?: string;
  microservice?: TMicroserviceNames;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      ACCESS_TOKEN_JWT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CSRF_TOKEN_JWT_SECRET: string;
      FACEBOOK_APP_ID: string;
      FACEBOOK_APP_SECRET: string | 'null';
      FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN: string | 'null';
      FACEBOOK_CSRF_TOKEN_JWT_SECRET: string;
      MICROSERVICE_TOKEN_JWT_SECRET: string;
      FRONTEND_SERVER_PUBLIC_KEY: string;
      COOKIE_SECRET: string;
      PGUSER: string;
      PGPASSWORD: string;
      PGHOST: string;
      PGDATABASE: string;
      PGPORT: string;
    }
  }

  namespace Express {
    export interface Request extends Params {}
  }
}

export {};
