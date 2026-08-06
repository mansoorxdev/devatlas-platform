import config from '#config/env.config.js';
import app from './app.js';
import logger from '#utils/logger.js';
import { connectDB } from './config/db.js';

const PORT = config.PORT;
let server;

// Register "uncaughtException" listener first to catch any errors during initialization
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Reusable Graceful Shutdown Helper
const gracefulShutdown = (signal, err) => {
  if (err) {
    logger.error(`CRITICAL: Server shutting down due to ${signal}...`, err);
  } else {
    logger.info(`Received ${signal}. Shutting down server gracefully...`);
  }

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(err ? 1 : 0);
    });
  } else {
    process.exit(err ? 1 : 0);
  }
};

// Connect to database then start HTTP Server
await connectDB();

server = app.listen(PORT, () => {
  logger.info(`🚀 Server successfully started in [${config.NODE_ENV}] mode on port [${PORT}]`);
});

// Register operational handlers for rejections and termination signals
process.on('unhandledRejection', (err) => {
  gracefulShutdown('unhandledRejection', err);
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});
