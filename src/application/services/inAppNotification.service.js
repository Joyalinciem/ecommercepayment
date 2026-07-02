class InAppNotificationService {
  addNotification(notification) {
    return { success: true, notification };
  }
}

module.exports = new InAppNotificationService();
