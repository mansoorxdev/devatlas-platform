import { AUTH_COOKIE_NAME } from '#constants/auth.constants.js';
import { verifyAccessToken } from '#utils/jwt.js';
import userRepository from '#repositories/user.repository.js';
import AppError from '#utils/app-error.js';
import asyncWrapper from '#utils/async-wrapper.js';

/**
 * Authentication middleware validating the incoming JWT access token cookie.
 * Attaches the verified user object to req.user.
 */
export const authenticate = asyncWrapper(async (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    throw new AppError('Authentication token is missing', 401, 'UNAUTHORIZED');
  }

  let decoded;
  try {
    // Only wrap JWT verification to convert token signature/expiry issues into 401
    decoded = verifyAccessToken(token);
  } catch (jwtError) {
    throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
  }

  if (!decoded || !decoded.id) {
    throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
  }

  // Database retrieval errors bubble up to asyncWrapper / global error handler directly (no masking)
  const user = await userRepository.findById(decoded.id);

  // Defense-in-depth: check user role is admin or writer and account is active
  if (!user || !['admin', 'writer'].includes(user.role)) {
    throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
  }

  if (user.isActive === false) {
    throw new AppError('Account deactivated. Please contact an administrator.', 403, 'ACCOUNT_DISABLED');
  }

  req.user = user;
  next();
});

export default authenticate;
