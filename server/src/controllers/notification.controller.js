import notificationService from '#services/notification.service.js';

export class NotificationController {
  /**
   * Protected Endpoint: Get paginated notifications for current user
   */
  async getNotifications(req, res) {
    const result = await notificationService.getNotifications(req.user.id, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Endpoint: Get unread count for current user
   */
  async getUnreadCount(req, res) {
    const result = await notificationService.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Endpoint: Mark single notification as read
   */
  async markAsRead(req, res) {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        notification,
      },
    });
  }

  /**
   * Protected Endpoint: Mark all notifications as read
   */
  async markAllAsRead(req, res) {
    const result = await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export default new NotificationController();
