import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '#config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log directory is server/logs relative to server/src/utils
const LOG_DIR = path.resolve(__dirname, '../../logs');

// Automatically create the logs directory if it does not exist before winston initializes
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// TODO: Integrate Winston exceptionHandlers and rejectionHandlers in future phases to capture unhandled errors directly within Winston

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(), // Support string interpolation and multiple log arguments
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If in development/test mode, log to console with colors
if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

export default logger;
