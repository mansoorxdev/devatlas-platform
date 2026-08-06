import jwt from 'jsonwebtoken';
import config from '#config/env.config.js';

/**
 * Generate an access token (JWT) signed with the config secret.
 * @param {object} payload - Payloads like { id, role } to sign.
 * @returns {string} Signed JWT Access Token.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Verify access token (JWT) using the config secret.
 * @param {string} token - Signed JWT Access Token.
 * @returns {object} Decoded and validated token payload.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Decode access token (JWT) without verification of the signature.
 * @param {string} token - Signed JWT Access Token.
 * @returns {object|null} Decoded token payload.
 */
export const decodeAccessToken = (token) => {
  return jwt.decode(token);
};
