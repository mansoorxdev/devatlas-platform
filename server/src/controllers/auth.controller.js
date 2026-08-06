import authService from '#services/auth.service.js';
import AppError from '#utils/app-error.js';
import { REFRESH_COOKIE_NAME } from '#constants/auth.constants.js';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
} from '#utils/cookie.js';

export class AuthController {
  /**
   * Controller handling Admin login HTTP request lifecycle
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set cookies utilizing modular cookie helper utility
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

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
   * Handles session Refresh Token Rotation (RTR) to issue fresh access/refresh cookies.
   */
  async refresh(req, res, next) {
    try {
      const oldRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

      if (!oldRefreshToken) {
        throw new AppError('Authentication token is missing', 401, 'UNAUTHORIZED');
      }

      const { user, accessToken, refreshToken } = await authService.refresh(oldRefreshToken);

      // Set rotated cookies
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      // Clear stale cookies so the browser does not retain invalid tokens
      clearAccessTokenCookie(res);
      clearRefreshTokenCookie(res);
      next(error);
    }
  }

  /**
   * Logs out admin sessions, deleting refresh tokens from database and clearing cookies.
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

      // Service handles DB deletion if present
      await authService.logout(refreshToken);

      // Clear cookies from client
      clearAccessTokenCookie(res);
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
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
