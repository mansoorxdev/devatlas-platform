import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';

/**
 * Error Solution API service wrapping public and protected admin endpoints.
 */
export const errorService = {
  // --- Public Endpoints ---

  /**
   * Get paginated list of published error solutions for public users.
   * @param {object} params - Query options { page, limit, search, tag, language, category, sort }
   */
  async getErrors(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ERRORS, { params });
    return response.data;
  },

  /**
   * Get single published error solution by slug.
   * @param {string} slug - Unique error solution slug
   */
  async getErrorBySlug(slug) {
    const response = await apiClient.get(`${API_ENDPOINTS.ERRORS}/s/${slug}`);
    return response.data;
  },

  // --- Protected Admin Endpoints ---

  /**
   * Get all error solutions (drafts + published) for admin management.
   * @param {object} params - Query options { page, limit, search, tag, language, category, status, sort }
   */
  async getAdminErrors(params = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ERRORS}/admin`, { params });
    return response.data;
  },

  /**
   * Get single error solution by ID for admin editor.
   * @param {string} id - Error solution ObjectId
   */
  async getAdminErrorById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.ERRORS}/admin/${id}`);
    return response.data;
  },

  /**
   * Create a new error solution as admin.
   * @param {object} payload - { title, errorMessage, category, language, cause, solution, codeFix, tags, status }
   */
  async createError(payload) {
    const response = await apiClient.post(API_ENDPOINTS.ERRORS, payload);
    return response.data;
  },

  /**
   * Update an existing error solution by ID.
   * @param {string} id - Error solution ObjectId
   * @param {object} payload - { title, errorMessage, category, language, cause, solution, codeFix, tags, status }
   */
  async updateError(id, payload) {
    const response = await apiClient.put(`${API_ENDPOINTS.ERRORS}/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle publication status of an error solution.
   * @param {string} id - Error solution ObjectId
   * @param {string} status - Target status ('draft' | 'published')
   */
  async toggleErrorStatus(id, status) {
    const response = await apiClient.patch(`${API_ENDPOINTS.ERRORS}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete an error solution by ID.
   * @param {string} id - Error solution ObjectId
   */
  async deleteError(id) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ERRORS}/${id}`);
    return response.data;
  },
};

export default errorService;
