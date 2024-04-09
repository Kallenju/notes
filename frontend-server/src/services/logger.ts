import winston from 'winston';
import 'winston-daily-rotate-file';

import { config } from '../shared/config.js';

const logger = winston.createLogger({
  silent: false,
  format: winston.format.json(),
  level: 'info',
  exitOnError: false,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: '/var/log/frontend-server/error_%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
    new winston.transports.DailyRotateFile({
      filename: '/var/log/frontend-server/combined.log_%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
    }),
  ],
  handleExceptions: true,
  handleRejections: true,
});

if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export { logger };
