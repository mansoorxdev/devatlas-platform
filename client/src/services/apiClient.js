import axios from 'axios';
import { API_ENDPOINTS } from '@/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback for clearAuth when 401 refresh fails
let onUnauthorizedCallback = null;

export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

// --- Silent Token Refresh Interceptor ---

// Auth endpoints that should NOT trigger a silent refresh on 401
const AUTH_BYPASS_URLS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT,
];

let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queue of failed requests after a refresh attempt.
 * @param {Error|null} error - If refresh failed, the error to reject with.
 */
const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor for handling 401 with silent refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 responses for non-auth endpoints that haven't been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !AUTH_BYPASS_URLS.some((url) => originalRequest.url?.includes(url))
    ) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent token refresh
        await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
        processQueue(null);
        // Retry the original failed request with new cookies
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Notify handler to clear auth state
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
