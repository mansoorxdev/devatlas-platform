import notificationRepository from '#repositories/notification.repository.js';
import User from '#models/user.model.js';
import AppError from '#utils/app-error.js';

export class NotificationService {
  /**
   * Fetch paginated notifications for authenticated user.
   */
  async getNotifications(userId, query = {}) {
    const { page = 1, limit = 10, isRead = 'all' } = query;
    return notificationRepository.findByRecipientWithPagination(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isRead,
    });
  }

  /**
   * Fetch unread notification count for authenticated user.
   */
  async getUnreadCount(userId) {
    const count = await notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  /**
   * Mark single notification as read for authenticated user.
   */
  async markAsRead(id, userId) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw new AppError('Notification not found or access denied', 404, 'NOT_FOUND');
    }
    return notification;
  }

  /**
   * Mark all notifications as read for authenticated user.
   */
  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  /**
   * Helper method to send an idempotent notification to a single user.
   */
  async notifyUser({ recipient, type, title, message, entityType, entityId, link, eventId }) {
    if (!recipient) return null;
    return notificationRepository.createIdempotent({
      recipient,
      type,
      title,
      message,
      entityType: entityType || 'system',
      entityId: entityId ? entityId.toString() : null,
      link: link || '',
      eventId: eventId || null,
    });
  }

  /**
   * Helper method to send an idempotent notification to all active administrators.
   */
  async notifyAdmins({ type, title, message, entityType, entityId, link, eventIdPrefix }) {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const results = await Promise.all(
      admins.map(async (admin) => {
        const eventId = eventIdPrefix ? `${eventIdPrefix}_admin_${admin._id}` : null;
        return this.notifyUser({
          recipient: admin._id,
          type,
          title,
          message,
          entityType,
          entityId,
          link,
          eventId,
        });
      })
    );
    return results;
  }
}

export default new NotificationService();
