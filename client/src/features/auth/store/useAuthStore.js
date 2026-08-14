import { create } from 'zustand';
import { authService } from '@features/auth/services/authService.js';
import { setOnUnauthorized } from '@/services/apiClient.js';

/**
 * Zustand store managing global authentication state.
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Validate existing session on app startup.
   * Calls GET /auth/me — if valid cookies exist, the user is restored.
   */
  initializeSession: async () => {
    try {
      const data = await authService.getMe();
      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Authenticate admin with email and password.
   */
  login: async (email, password) => {
    const data = await authService.login(email, password);
    set({
      user: data.data.user,
      isAuthenticated: true,
    });
    return data;
  },

  /**
   * Log out the current admin session.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Silently ignore logout API errors — clear state regardless
    }
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  /**
   * Reset auth state without an API call.
   * Used by the Axios interceptor when a 401 refresh attempt fails.
   */
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));

// Register callback with apiClient so 401 refresh failures reset store state cleanly
setOnUnauthorized(() => {
  useAuthStore.getState().clearAuth();
});

export default useAuthStore;
