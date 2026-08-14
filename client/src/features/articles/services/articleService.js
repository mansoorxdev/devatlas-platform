import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';

/**
 * Article API service wrapping public and protected admin endpoints.
 */
export const articleService = {
  // --- Public Endpoints ---

  /**
   * Get paginated list of published articles for public users.
   * @param {object} params - Query options { page, limit, search, tag, sort }
   */
  async getArticles(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ARTICLES, { params });
    return response.data;
  },

  /**
   * Get single published article by slug.
   * @param {string} slug - Unique article slug
   */
  async getArticleBySlug(slug) {
    const response = await apiClient.get(`${API_ENDPOINTS.ARTICLES}/s/${slug}`);
    return response.data;
  },

  // --- Protected Admin Endpoints ---

  /**
   * Get all articles (drafts + published) for admin management.
   * @param {object} params - Query options { page, limit, search, tag, status, sort }
   */
  async getAdminArticles(params = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ARTICLES}/admin`, { params });
    return response.data;
  },

  /**
   * Get single article by ID for admin editor.
   * @param {string} id - Article ObjectId
   */
  async getAdminArticleById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.ARTICLES}/admin/${id}`);
    return response.data;
  },

  /**
   * Create a new article as admin.
   * @param {object} payload - { title, summary, content, tags, status }
   */
  async createArticle(payload) {
    const response = await apiClient.post(API_ENDPOINTS.ARTICLES, payload);
    return response.data;
  },

  /**
   * Update an existing article by ID.
   * @param {string} id - Article ObjectId
   * @param {object} payload - { title, summary, content, tags, status }
   */
  async updateArticle(id, payload) {
    const response = await apiClient.put(`${API_ENDPOINTS.ARTICLES}/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle publication status of an article.
   * @param {string} id - Article ObjectId
   * @param {string} status - Target status ('draft' | 'published')
   */
  async toggleArticleStatus(id, status) {
    const response = await apiClient.patch(`${API_ENDPOINTS.ARTICLES}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete an article by ID.
   * @param {string} id - Article ObjectId
   */
  async deleteArticle(id) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ARTICLES}/${id}`);
    return response.data;
  },
};

export default articleService;
