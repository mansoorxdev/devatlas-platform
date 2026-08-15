import AppError from '#utils/app-error.js';
import asyncWrapper from '#utils/async-wrapper.js';

/**
 * Authorization middleware protecting routes to be accessible by Writer or Admin users.
 */
export const authorizeWriter = asyncWrapper(async (req, res, next) => {
  if (!req.user || !['writer', 'admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Writer or Administrator privileges required.', 403, 'FORBIDDEN');
  }

  if (req.user.role === 'writer') {
    if (req.user.writerStatus && req.user.writerStatus !== 'approved') {
      throw new AppError('Access denied. Writer application is not approved.', 403, 'FORBIDDEN');
    }
    if (req.user.isActive === false) {
      throw new AppError('Access denied. Writer account is inactive.', 403, 'ACCOUNT_DISABLED');
    }
  }

  next();
});

export default authorizeWriter;
