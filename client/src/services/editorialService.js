import apiClient from './apiClient';

export const editorialService = {
  /**
   * Fetch admin editorial review queue.
   */
  async getReviewQueue(params = {}) {
    const response = await apiClient.get('/articles/admin/review', { params });
    return response.data;
  },

  /**
   * Approve and publish a submitted article.
   */
  async approveArticle(id) {
    const response = await apiClient.patch(`/articles/admin/${id}/approve`);
    return response.data;
  },

  /**
   * Request changes from author with required feedback note.
   */
  async requestChanges(id, reviewNote) {
    const response = await apiClient.patch(`/articles/admin/${id}/request-changes`, { reviewNote });
    return response.data;
  },

  /**
   * Reject an article with required rejection reason.
   */
  async rejectArticle(id, reviewNote) {
    const response = await apiClient.patch(`/articles/admin/${id}/reject`, { reviewNote });
    return response.data;
  },

  /**
   * Unpublish an article.
   */
  async unpublishArticle(id, note = '') {
    const response = await apiClient.patch(`/articles/admin/${id}/unpublish`, { note });
    return response.data;
  },

  /**
   * Archive an article.
   */
  async archiveArticle(id, note = '') {
    const response = await apiClient.patch(`/articles/admin/${id}/archive`, { note });
    return response.data;
  },

  /**
   * Restore an archived or unpublished article.
   */
  async restoreArticle(id) {
    const response = await apiClient.patch(`/articles/admin/${id}/restore`);
    return response.data;
  },

  /**
   * Toggle featured status of an article.
   */
  async toggleFeatured(id, isFeatured) {
    const response = await apiClient.patch(`/articles/admin/${id}/feature`, { isFeatured });
    return response.data;
  },

  /**
   * Fetch revision history of an article.
   */
  async getRevisionHistory(id) {
    const response = await apiClient.get(`/articles/admin/${id}/history`);
    return response.data;
  },
};

export default editorialService;
