/* eslint-disable @typescript-eslint/no-empty-interface */

interface Params {
  userEmail?: string;
  view: 'index' | 'dashboard';
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      BACKEND_URL: string;
      BACKEND_TOKEN: string;
      AUTH_PRIVATE_KEY: string;
      AUTH_PASSPHRASE: string;
      AWS_FRONTEND_BUCKET: string;
      AWS_FRONTEND_BUCKET_ARN: string;
    }
  }

  namespace Express {
    export interface Request extends Params {}
  }
}

export {};
