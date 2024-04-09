import crypto from 'crypto';

export function getHashedPassword(password: string): {
  hashedPassword: string;
  salt: string;
} {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return {
    hashedPassword,
    salt,
  };
}
