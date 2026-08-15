import apiClient from './apiClient';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  },
};

export default notificationService;
