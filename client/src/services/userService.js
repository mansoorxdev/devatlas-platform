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
   * Toggle writer active/inactive status.
   */
  async toggleWriterStatus(id, isActive) {
    const response = await apiClient.patch(`/users/writers/${id}/status`, { isActive });
    return response.data;
  },
};

export default userService;
