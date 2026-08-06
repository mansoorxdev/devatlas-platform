import crypto from 'crypto';
import RefreshToken from '#models/refresh-token.model.js';

export class RefreshTokenRepository {
  /**
   * Hash a plain token string using SHA256.
   * @param {string} token - The plain text token.
   * @returns {string} Hexadecimal SHA256 hash.
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create and store a new refresh token.
   * Pre-save hook in RefreshToken model automatically handles token hashing.
   */
  async create(userId, token, expiresAt) {
    return RefreshToken.create({
      userId,
      token,
      expiresAt,
    });
  }

  /**
   * Find a valid, non-expired refresh token document by its plain token string.
   * @param {string} plainToken - Plain text refresh token.
   * @returns {Promise<object|null>} The token document, if valid.
   */
  async findValidToken(plainToken) {
    const hashedToken = this.hashToken(plainToken);
    return RefreshToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Delete a specific token document by its plain token string.
   * @param {string} plainToken - Plain text refresh token.
   * @returns {Promise<object>} Delete result stats.
   */
  async deleteToken(plainToken) {
    const hashedToken = this.hashToken(plainToken);
    return RefreshToken.deleteOne({ token: hashedToken });
  }

  /**
   * Delete all tokens associated with a specific user.
   * @param {string} userId - User ID string.
   * @returns {Promise<object>} Delete result stats.
   */
  async deleteAllTokensForUser(userId) {
    return RefreshToken.deleteMany({ userId });
  }
}

export default new RefreshTokenRepository();
