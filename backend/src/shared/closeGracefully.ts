import { db } from '../database.js';
import { server } from '../app.js';

import { logger } from '../services/logger.js';

let closeGracefullyCalled = false;

export async function closeGracefully(
  signal: 'SIGINT' | 'SIGTERM' | 'SIGKILL',
): Promise<void> {
  try {
    if (closeGracefullyCalled) {
      logger.info(`*^!@4=> Received one more signal to terminate: ${signal}`);

      return;
    }

    closeGracefullyCalled = true;

    logger.info(`*^!@4=> Received signal to terminate: ${signal}`);

    server?.close((error) => {
      if (error) {
        logger.error(
          `Error occurs on server closing:\n${error}\n${error instanceof Error ? error.stack : ''}`,
        );

        throw error;
      }
    });
    await db.end();

    logger.info('Exit...');

    process.exit(0);
  } catch (error) {
    logger.error(
      `Error occurs on graceful closing:\n${error}\n${error instanceof Error ? error.stack : ''}`,
    );

    process.exit(1);
  }
}
