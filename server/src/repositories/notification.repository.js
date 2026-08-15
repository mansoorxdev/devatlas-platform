import Notification from '#models/notification.model.js';

export class NotificationRepository {
  /**
   * Create notification idempotently.
   * Prevents duplicate notifications for the same event using eventId or recent duplicate check.
   */
  async createIdempotent(data) {
    if (data.eventId) {
      const existing = await Notification.findOne({ eventId: data.eventId });
      if (existing) return existing;
    } else if (data.recipient && data.type && data.entityId) {
      // Short-window deduplication check (2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 120000);
      const recent = await Notification.findOne({
        recipient: data.recipient,
        type: data.type,
        entityId: data.entityId,
        createdAt: { $gte: twoMinutesAgo },
      });
      if (recent) return recent;
    }

    try {
      return await Notification.create(data);
    } catch (err) {
      if (err.code === 11000 && data.eventId) {
        // E11000 duplicate key error on eventId idempotency key
        return Notification.findOne({ eventId: data.eventId });
      }
      throw err;
    }
  }

  /**
   * Find paginated notifications for a recipient
   */
  async findByRecipientWithPagination(recipientId, { page = 1, limit = 10, isRead = 'all' }) {
    const filter = { recipient: recipientId };

    if (isRead === 'true') filter.isRead = true;
    if (isRead === 'false') filter.isRead = false;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Count unread notifications for a recipient
   */
  async countUnread(recipientId) {
    return Notification.countDocuments({ recipient: recipientId, isRead: false });
  }

  /**
   * Mark single notification as read for recipient
   */
  async markAsRead(id, recipientId) {
    return Notification.findOneAndUpdate(
      { _id: id, recipient: recipientId },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );
  }

  /**
   * Mark all notifications as read for recipient
   */
  async markAllAsRead(recipientId) {
    return Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

export default new NotificationRepository();
