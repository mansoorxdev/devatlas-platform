import config from '#config/env.config.js';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '#constants/auth.constants.js';
import { parseDurationToMs } from '#utils/duration.js';

/**
 * Helper generating base secure cookie options.
 * @returns {object} Base cookie configurations.
 */
const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'Strict',
  path: '/',
});

/**
 * Set the Access Token (JWT) in a secure HttpOnly cookie.
 * Cookie maxAge is derived from the configured JWT_EXPIRES_IN value.
 * @param {object} res - Express response object.
 * @param {string} token - Signed access token.
 */
export const setAccessTokenCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getBaseCookieOptions(),
    maxAge: parseDurationToMs(config.JWT_EXPIRES_IN),
  });
};

/**
 * Set the Refresh Token (JWT) in a secure HttpOnly cookie.
 * Cookie maxAge is derived from the configured JWT_REFRESH_EXPIRES_IN value.
 * @param {object} res - Express response object.
 * @param {string} token - Signed refresh token.
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...getBaseCookieOptions(),
    maxAge: parseDurationToMs(config.JWT_REFRESH_EXPIRES_IN),
  });
};

/**
 * Clear the Access Token cookie from the client.
 * @param {object} res - Express response object.
 */
export const clearAccessTokenCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getBaseCookieOptions());
};

/**
 * Clear the Refresh Token cookie from the client.
 * @param {object} res - Express response object.
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getBaseCookieOptions());
};
