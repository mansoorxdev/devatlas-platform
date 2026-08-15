import rateLimit from 'express-rate-limit';

const isTestEnv = () => process.env.NODE_ENV === 'test';

/**
 * Standard public API rate limiter for general content discovery endpoints
 * Limits each IP to 300 requests per 15 minutes.
 */
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  skip: isTestEnv,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for Login / Registration attempts to prevent automated brute-forcing
 * Limits each IP to 5 attempts per 15 minutes in production (bypassed in test environment).
 */
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skip: isTestEnv,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login or registration attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Token Refresh rate limiter to prevent session rotation spamming
 * Limits each IP to 30 refresh requests per 15 minutes.
 */
export const authRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  skip: isTestEnv,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many token refresh attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Global Search endpoint rate limiter to prevent expensive multi-collection database query exhaustion
 * Limits each IP to 60 search queries per 15 minutes.
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  skip: isTestEnv,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Search query rate limit exceeded. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default publicApiLimiter;
