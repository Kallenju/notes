const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  AUTH_PRIVATE_KEY: process.env.AUTH_PRIVATE_KEY,
  AUTH_PASSPHRASE: process.env.AUTH_PASSPHRASE,
  AUTH_ALGORITHM: 'RS256',
  BACKEND_URL: process.env.BACKEND_URL,
  BACKEND_TOKEN: process.env.BACKEND_TOKEN,
} as const satisfies typeof process.env;

for (const [key, value] of Object.entries(config)) {
  if (value !== undefined) {
    continue;
  }

  console.error(new Error(`Env ${key} is undefined`));

  process.exit(1);
}

export { config };
