import path from 'node:path';
import fs from 'node:fs/promises';

const config =
  process.env.NODE_ENV !== 'production'
    ? ({
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        ACCESS_TOKEN_JWT_SECRET: process.env.ACCESS_TOKEN_JWT_SECRET,
        ACCESS_TOKEN_JWT_ALGORITHM: 'HS256',
        ACCESS_TOKEN_JWT_TOKEN_LIFE_TIME: '1d',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CSRF_TOKEN_JWT_SECRET: process.env.GOOGLE_CSRF_TOKEN_JWT_SECRET,
        GOOGLE_CSRF_TOKEN_JWT_ALGORITHM: 'HS256',
        GOOGLE_CSRF_TOKEN_JWT_TOKEN_LIFE_TIME: '1h',
        FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
        FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
        FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN:
          process.env.FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN,
        FACEBOOK_CSRF_TOKEN_JWT_SECRET:
          process.env.FACEBOOK_CSRF_TOKEN_JWT_SECRET,
        FACEBOOK_CSRF_TOKEN_JWT_ALGORITHM: 'HS256',
        FACEBOOK_CSRF_TOKEN_JWT_TOKEN_LIFE_TIME: '1h',
        MICROSERVICE_TOKEN_JWT_SECRET:
          process.env.MICROSERVICE_TOKEN_JWT_SECRET,
        MICROSERVICE_TOKEN_JWT_ALGORITHM: 'HS256',
        MICROSERVICE_TOKEN_JWT_TOKEN_LIFE_TIME: '14d',
        FRONTEND_SERVER_PUBLIC_KEY: process.env.FRONTEND_SERVER_PUBLIC_KEY,
        COOKIE_SECRET: process.env.COOKIE_SECRET,
        PGUSER: process.env.PGUSER,
        PGPASSWORD: process.env.PGPASSWORD,
        PGHOST: process.env.PGHOST,
        PGDATABASE: process.env.PGDATABASE,
        PGPORT: process.env.PGPORT,
      } as const satisfies typeof process.env)
    : await (async () => {
        try {
          const [
            ACCESS_TOKEN_JWT_SECRET,
            GOOGLE_CLIENT_ID,
            GOOGLE_CSRF_TOKEN_JWT_SECRET,
            FACEBOOK_APP_ID,
            FACEBOOK_APP_SECRET,
            FACEBOOK_CSRF_TOKEN_JWT_SECRET,
            MICROSERVICE_TOKEN_JWT_SECRET,
            FRONTEND_SERVER_PUBLIC_KEY,
            COOKIE_SECRET,
            PGPASSWORD,
          ] = await Promise.all(
            [
              process.env.ACCESS_TOKEN_JWT_SECRET,
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CSRF_TOKEN_JWT_SECRET,
              process.env.FACEBOOK_APP_ID,
              process.env.FACEBOOK_APP_SECRET,
              process.env.FACEBOOK_CSRF_TOKEN_JWT_SECRET,
              process.env.MICROSERVICE_TOKEN_JWT_SECRET,
              process.env.FRONTEND_SERVER_PUBLIC_KEY,
              process.env.COOKIE_SECRET,
              process.env.PGPASSWORD,
            ].map(async (secretPath) => {
              const secret = await fs.readFile(path.normalize(secretPath), {
                encoding: 'utf8',
              });

              return secret.replace(/\n$/, '');
            }),
          );

          return {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            ACCESS_TOKEN_JWT_SECRET,
            ACCESS_TOKEN_JWT_ALGORITHM: 'HS256',
            ACCESS_TOKEN_JWT_TOKEN_LIFE_TIME: '1d',
            GOOGLE_CLIENT_ID,
            GOOGLE_CSRF_TOKEN_JWT_SECRET,
            GOOGLE_CSRF_TOKEN_JWT_ALGORITHM: 'HS256',
            GOOGLE_CSRF_TOKEN_JWT_TOKEN_LIFE_TIME: '1h',
            FACEBOOK_APP_ID,
            FACEBOOK_APP_SECRET,
            FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN:
              process.env.FACEBOOK_APP_DEVELOPMENT_ACCESS_TOKEN,
            FACEBOOK_CSRF_TOKEN_JWT_SECRET,
            FACEBOOK_CSRF_TOKEN_JWT_ALGORITHM: 'HS256',
            FACEBOOK_CSRF_TOKEN_JWT_TOKEN_LIFE_TIME: '1h',
            MICROSERVICE_TOKEN_JWT_SECRET,
            MICROSERVICE_TOKEN_JWT_ALGORITHM: 'HS256',
            MICROSERVICE_TOKEN_JWT_TOKEN_LIFE_TIME: '14d',
            FRONTEND_SERVER_PUBLIC_KEY,
            COOKIE_SECRET,
            PGUSER: process.env.PGUSER,
            PGPASSWORD,
            PGHOST: process.env.PGHOST,
            PGDATABASE: process.env.PGDATABASE,
            PGPORT: process.env.PGPORT,
          } as const satisfies typeof process.env;
        } catch (error) {
          if (error instanceof Error) {
            console.error(new Error(`Cannot read secret: ${error.message}`));
          } else {
            console.error(new Error(`Cannot read secret: ${error}`));
          }

          process.exit(1);
        }
      })();

for (const [key, value] of Object.entries(config)) {
  if (value !== undefined) {
    continue;
  }

  console.error(new Error(`Env ${key} is undefined`));

  process.exit(1);
}

export { config };
