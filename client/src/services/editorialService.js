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
};

export default editorialService;
