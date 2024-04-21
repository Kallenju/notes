import { initDB } from './database.js';
import { startServer } from './app.js';
import { closeGracefully } from './shared/closeGracefully.js';

import { logger } from './services/logger.js';

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

initDB()
  .then(() => {
    startServer();
  })
  .catch((error: unknown) => {
    logger.error(
      `Cannot start test backend. Error:\n${error instanceof Error && error.stack ? error.stack : error}\n____________________________________\n`,
    );

    process.emit('SIGTERM');
  });
