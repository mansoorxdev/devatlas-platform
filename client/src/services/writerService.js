import apiClient from './apiClient';

export const writerService = {
  /**
   * Get writer's own articles with pagination & status filters.
   */
  async getMyArticles(params = {}) {
    const response = await apiClient.get('/articles/my', { params });
    return response.data;
  },

  /**
   * Get stats for writer dashboard.
   */
  async getMyStats() {
    const response = await apiClient.get('/articles/my/stats');
    return response.data;
  },

  /**
   * Get single article owned by writer by ID.
   */
  async getMyArticleById(id) {
    const response = await apiClient.get(`/articles/writer/${id}`);
    return response.data;
  },

  /**
   * Create a new article as Writer.
   */
  async createArticle(data) {
    const response = await apiClient.post('/articles/writer', data);
    return response.data;
  },

  /**
   * Update an existing article owned by Writer.
   */
  async updateArticle(id, data) {
    const response = await apiClient.put(`/articles/writer/${id}`, data);
    return response.data;
  },

  /**
   * Submit or resubmit an article for editorial review.
   */
  async submitArticle(id) {
    const response = await apiClient.patch(`/articles/writer/${id}/submit`);
    return response.data;
  },
};

export default writerService;
