import apiClient from './apiClient';

export const userService = {
  /**
   * Get list of writers with article stats.
   */
  async getWriters(params = {}) {
    const response = await apiClient.get('/users/writers', { params });
    return response.data;
  },

  /**
   * Get details of a single writer by ID.
   */
  async getWriterById(id) {
    const response = await apiClient.get(`/users/writers/${id}`);
    return response.data;
  },

  /**
   * Get writer performance analytics by ID (Admin only).
   */
  async getWriterPerformance(id) {
    const response = await apiClient.get(`/users/writers/${id}/performance`);
    return response.data;
  },

  /**
   * Toggle writer active/inactive status.
   */
  async toggleWriterStatus(id, isActive) {
    const response = await apiClient.patch(`/users/writers/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Get authenticated user's profile.
   */
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  /**
   * Update authenticated user's profile.
   */
  async updateProfile(data) {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  /**
   * Fetch public author profile by slug with published articles.
   */
  async getPublicAuthorProfile(slug, params = {}) {
    const response = await apiClient.get(`/users/authors/${slug}`, { params });
    return response.data;
  },
};

export default userService;
