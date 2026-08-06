import authService from '#services/auth.service.js';
import config from '#config/env.config.js';

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

      // Set token inside cookie
      res.cookie('token', token, cookieOptions);

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
}

export default new AuthController();
