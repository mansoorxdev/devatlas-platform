import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';

/**
 * Auth API service — thin wrapper over Axios calls to backend auth endpoints.
 * All requests use HttpOnly cookie-based authentication via withCredentials.
 */
export const authService = {
  /**
   * Authenticate admin with email and password.
   * @param {string} email - Admin email address.
   * @param {string} password - Admin password.
   * @returns {Promise<object>} Response containing user data.
   */
  async login(email, password) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  },

  /**
   * Log out the current admin session.
   * @returns {Promise<object>} Response confirming logout.
   */
  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  /**
   * Retrieve the currently authenticated admin user.
   * @returns {Promise<object>} Response containing user data.
   */
  async getMe() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Refresh the access token using the refresh token cookie.
   * @returns {Promise<object>} Response confirming token rotation.
   */
  async refresh() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },
};

export default authService;
