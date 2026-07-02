const Notification = require('../models/notification.model');

class NotificationRepository {
  create(notification) {
    return Notification.create(notification);
  }
}

module.exports = new NotificationRepository();
