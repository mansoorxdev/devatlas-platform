import userRepository from '#repositories/user.repository.js';
import refreshTokenRepository from '#repositories/refresh-token.repository.js';
import AppError from '#utils/app-error.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '#utils/jwt.js';
import { parseDurationToMs } from '#utils/duration.js';
import config from '#config/env.config.js';

export class AuthService {
  /**
   * Helper to compute refresh token expiration date from config duration string.
   * @returns {Date} Expiry date.
   */
  getRefreshTokenExpiry() {
    return new Date(Date.now() + parseDurationToMs(config.JWT_REFRESH_EXPIRES_IN));
  }

  /**
   * Logical service handling Admin login authentication, token signing, and session storage
   */
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by email
    const user = await userRepository.findByEmail(normalizedEmail);

    // Defense-in-depth: generic message to prevent email enumeration attacks
    if (!user || !['admin', 'writer'].includes(user.role)) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    if (user.isActive === false) {
      throw new AppError('Account deactivated. Please contact an administrator.', 403, 'ACCOUNT_DISABLED');
    }

    // Verify password hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    // Single active admin session enforcement: revoke all previous tokens before issuing a new one
    await refreshTokenRepository.deleteAllTokensForUser(user._id);

    // Minimal access payload containing only ID and role as requested
    const accessPayload = {
      id: user._id.toString(),
      role: user.role,
    };

    // Refresh token payload containing user ID
    const refreshPayload = {
      id: user._id.toString(),
    };

    // Generate tokens utilizing JWT utility
    const accessToken = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);

    // Store hashed refresh token in database with dynamic expiresAt
    const expiresAt = this.getRefreshTokenExpiry();
    await refreshTokenRepository.create(user._id, refreshToken, expiresAt);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Handles Refresh Token Rotation (RTR) to issue new tokens.
   */
  async refresh(refreshTokenString) {
    let decoded;
    try {
      // 1. Verify signature of the incoming refresh token
      decoded = verifyRefreshToken(refreshTokenString);
    } catch (jwtError) {
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }

    if (!decoded || !decoded.id) {
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }

    // 2. Validate token storage in the repository (non-expired)
    const storedToken = await refreshTokenRepository.findValidToken(refreshTokenString);
    if (!storedToken) {
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }

    // 3. Look up user by ID
    const user = await userRepository.findById(storedToken.userId);

    // 4. Defense-in-depth: verify user exists, is active, and has valid role
    if (!user || !['admin', 'writer'].includes(user.role) || user.isActive === false) {
      // Invalidate the compromised/revoked refresh token immediately
      await refreshTokenRepository.deleteToken(refreshTokenString);
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }

    // 5. Invalidate / delete old refresh token (Refresh Token Rotation)
    await refreshTokenRepository.deleteToken(refreshTokenString);

    // 6. Generate fresh tokens
    const accessPayload = {
      id: user._id.toString(),
      role: user.role,
    };
    const refreshPayload = {
      id: user._id.toString(),
    };

    const newAccessToken = generateAccessToken(accessPayload);
    const newRefreshToken = generateRefreshToken(refreshPayload);

    // 7. Store new hashed refresh token in DB with dynamic expiresAt
    const expiresAt = this.getRefreshTokenExpiry();
    await refreshTokenRepository.create(user._id, newRefreshToken, expiresAt);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Log out an admin session by invalidating the refresh token.
   */
  async logout(refreshTokenString) {
    if (refreshTokenString) {
      await refreshTokenRepository.deleteToken(refreshTokenString);
    }
  }
}

export default new AuthService();
