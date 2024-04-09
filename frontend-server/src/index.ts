import { startServer } from './app.js';
import { backend } from './services/backend.js';
import { closeGracefully } from './shared/closeGracefully.js';
import { logger } from './services/logger.js';

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

backend
  .startConnectionWithBackend()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    logger.error(
      `Cannot start frontend-server. Error:\n${error instanceof Error && error.stack ? error.stack : error}\n____________________________________\n`,
    );

    process.emit('SIGTERM');
  });
