import morgan from 'morgan';
import logger from '#utils/logger.js';

const stream = {
  write: (message) => logger.info(message.trim()),
};

// Configure Morgan to stream requests through winston
const requestLogger = morgan(
  ':remote-addr - :method :url :status - :response-time ms',
  { stream }
);

export default requestLogger;
