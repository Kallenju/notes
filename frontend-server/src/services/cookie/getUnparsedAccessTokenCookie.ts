import { accessTokenCookieName } from './types.js';

export function getUnparsedAccessTokenCookie(
  cookies: Record<string, unknown>,
): string | null {
  const accessTokenCookie: unknown = cookies[accessTokenCookieName];

  return typeof accessTokenCookie === 'string' ? accessTokenCookie : null;
}
