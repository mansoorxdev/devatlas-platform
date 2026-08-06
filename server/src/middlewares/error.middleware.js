import logger from '#utils/logger.js';
import config from '#config/env.config.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const errorCode = err.code ?? 'INTERNAL_SERVER_ERROR';
  const isOperational = err.isOperational === true;

  // Structured log fields for Winston logger
  const logDetails = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorCode,
    message: err.message,
    stack: err.stack,
  };

  // Log utilizing fully structured objects
  if (statusCode >= 500) {
    logger.error({
      event: 'Internal Server Error',
      ...logDetails,
    });
  } else {
    logger.warn({
      event: 'Operational Warning',
      ...logDetails,
    });
  }

  const response = {
    success: false,
    error: {
      code: errorCode,
      message: err.message,
    },
  };

  // Add stack trace in development mode for easier debugging
  if (config.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // If in production and error is non-operational, mask the message
  if (!isOperational && config.NODE_ENV === 'production') {
    response.error.code = 'INTERNAL_SERVER_ERROR';
    response.error.message = 'An unexpected error occurred.';
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
