import crypto from 'crypto';

export function verifyPassword(
  password: string,
  hashedPassword: string,
  salt: string,
): boolean {
  return (
    hashedPassword ===
    crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)
  );
}
