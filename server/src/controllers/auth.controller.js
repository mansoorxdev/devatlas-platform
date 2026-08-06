import authService from '#services/auth.service.js';
import config from '#config/env.config.js';
import { AUTH_COOKIE_NAME } from '#constants/auth.constants.js';

export class AuthController {
  /**
   * Controller handling Admin login HTTP request lifecycle
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { user, token } = await authService.login(email, password);

      // Secure HTTP-only SameSite=Strict cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'Strict', // SameSite strict enforced
        maxAge: 15 * 60 * 1000, // 15 minutes matching token expiry
      };

      // Set token inside cookie using AUTH_COOKIE_NAME constant
      res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

      // Send consistent JSON response (Mongoose serialization automatically strips internal database fields)
      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve the currently authenticated admin user
   */
  async getMe(req, res, next) {
    try {
      // Send consistent JSON response (Mongoose serialization automatically strips internal database fields)
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
