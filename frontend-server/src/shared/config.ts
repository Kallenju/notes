import path from 'node:path';
import fs from 'node:fs/promises';

const config =
  process.env.NODE_ENV !== 'production'
    ? ({
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        AUTH_PRIVATE_KEY: process.env.AUTH_PRIVATE_KEY,
        AUTH_PASSPHRASE: process.env.AUTH_PASSPHRASE,
        AUTH_ALGORITHM: 'RS256',
        BACKEND_URL: process.env.BACKEND_URL,
        BACKEND_TOKEN: process.env.BACKEND_TOKEN,
      } as const satisfies typeof process.env)
    : await (async () => {
        try {
          const [AUTH_PRIVATE_KEY, AUTH_PASSPHRASE] = await Promise.all(
            [process.env.AUTH_PRIVATE_KEY, process.env.AUTH_PASSPHRASE].map(
              async (secretPath) =>
                fs.readFile(path.normalize(secretPath), { encoding: 'utf8' }),
            ),
          );

          return {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            AUTH_PRIVATE_KEY,
            AUTH_PASSPHRASE,
            AUTH_ALGORITHM: 'RS256',
            BACKEND_URL: process.env.BACKEND_URL,
            BACKEND_TOKEN: process.env.BACKEND_TOKEN,
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
