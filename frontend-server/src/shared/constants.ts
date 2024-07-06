import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_FRONTEND_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'frontend',
);

export { BASE_FRONTEND_PATH };
