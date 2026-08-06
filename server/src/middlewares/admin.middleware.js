import AppError from '#utils/app-error.js';
import asyncWrapper from '#utils/async-wrapper.js';

/**
 * Authorization middleware protecting routes to be only accessible by Admin users.
 */
export const authorizeAdmin = asyncWrapper(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Access denied. Administrator privileges required.', 403, 'FORBIDDEN');
  }
  next();
});

export default authorizeAdmin;
