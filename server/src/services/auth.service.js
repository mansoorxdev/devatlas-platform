import userRepository from '#repositories/user.repository.js';
import AppError from '#utils/app-error.js';
import { generateAccessToken } from '#utils/jwt.js';

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

    // Generate token utilizing reusable JWT utility helper
    const token = generateAccessToken(payload);

    return {
      user,
      token,
    };
  }
}

export default new AuthService();
