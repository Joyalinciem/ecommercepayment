const Notification = require('../../data/models/notification.model');
const sseService = require('./sse.service');

class NotificationService {
  async sendNotification(notification) {
    const payload = {
      recipientId: notification.recipientId || notification.userId || notification.vendorId || 'system',
      type: notification.type || 'general',
      title: notification.title || 'New activity',
      message: notification.message || 'You have a new update.',
      metadata: notification.meta || notification.metadata || {},
      isRead: false,
    };

    const created = await Notification.create(payload);
    sseService.publish('notification', payload.recipientId, 'notification', created);
    return { success: true, notification: created };
  }

  async getNotifications(recipientId) {
    return Notification.find({ recipientId }).sort({ createdAt: -1 }).limit(20);
  }
}

module.exports = new NotificationService();
