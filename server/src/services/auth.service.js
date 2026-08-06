import jwt from 'jsonwebtoken';
import userRepository from '#repositories/user.repository.js';
import AppError from '#utils/app-error.js';
import config from '#config/env.config.js';

export class AuthService {
  /**
   * Logical service handling Admin login authentication and JWT issuing
   */
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by email
    const user = await userRepository.findByEmail(normalizedEmail);

    // Defense-in-depth: generic message to prevent email enumeration attacks
    if (!user || user.role !== 'admin') {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    // Verify password hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    // Minimal payload containing only ID and role as requested
    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    // Generate token utilizing configured secret and expiration
    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    return {
      user,
      token,
    };
  }
}

export default new AuthService();
