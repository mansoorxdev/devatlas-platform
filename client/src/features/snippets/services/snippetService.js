import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';

/**
 * Snippet API service wrapping public and protected admin endpoints.
 */
export const snippetService = {
  // --- Public Endpoints ---

  /**
   * Get paginated list of published snippets for public users.
   * @param {object} params - Query options { page, limit, search, tag, language, sort }
   */
  async getSnippets(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.SNIPPETS, { params });
    return response.data;
  },

  /**
   * Get single published snippet by slug.
   * @param {string} slug - Unique snippet slug
   */
  async getSnippetBySlug(slug) {
    const response = await apiClient.get(`${API_ENDPOINTS.SNIPPETS}/s/${slug}`);
    return response.data;
  },

  // --- Protected Admin Endpoints ---

  /**
   * Get all snippets (drafts + published) for admin management.
   * @param {object} params - Query options { page, limit, search, tag, language, status, sort }
   */
  async getAdminSnippets(params = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.SNIPPETS}/admin`, { params });
    return response.data;
  },

  /**
   * Get single snippet by ID for admin editor.
   * @param {string} id - Snippet ObjectId
   */
  async getAdminSnippetById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.SNIPPETS}/admin/${id}`);
    return response.data;
  },

  /**
   * Create a new snippet as admin.
   * @param {object} payload - { title, summary, code, language, tags, status }
   */
  async createSnippet(payload) {
    const response = await apiClient.post(API_ENDPOINTS.SNIPPETS, payload);
    return response.data;
  },

  /**
   * Update an existing snippet by ID.
   * @param {string} id - Snippet ObjectId
   * @param {object} payload - { title, summary, code, language, tags, status }
   */
  async updateSnippet(id, payload) {
    const response = await apiClient.put(`${API_ENDPOINTS.SNIPPETS}/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle publication status of a snippet.
   * @param {string} id - Snippet ObjectId
   * @param {string} status - Target status ('draft' | 'published')
   */
  async toggleSnippetStatus(id, status) {
    const response = await apiClient.patch(`${API_ENDPOINTS.SNIPPETS}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete a snippet by ID.
   * @param {string} id - Snippet ObjectId
   */
  async deleteSnippet(id) {
    const response = await apiClient.delete(`${API_ENDPOINTS.SNIPPETS}/${id}`);
    return response.data;
  },
};

export default snippetService;
