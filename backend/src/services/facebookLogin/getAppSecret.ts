import { config } from '../../shared/config.js';

export function getAppSecret(): string {
  return config.FACEBOOK_APP_SECRET;
}
