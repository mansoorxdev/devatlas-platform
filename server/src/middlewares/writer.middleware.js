import AppError from '#utils/app-error.js';
import asyncWrapper from '#utils/async-wrapper.js';

/**
 * Authorization middleware protecting routes to be accessible by Writer or Admin users.
 */
export const authorizeWriter = asyncWrapper(async (req, res, next) => {
  if (!req.user || !['writer', 'admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Writer or Administrator privileges required.', 403, 'FORBIDDEN');
  }
  next();
});

export default authorizeWriter;
