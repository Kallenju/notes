import { generateKeySync } from 'node:crypto';

function generateJWTSecretKey() {
  return generateKeySync('hmac', { length: 256 }).export().toString('hex');
}

process.stdout.write(`${generateJWTSecretKey()}`);

process.exit(0);
