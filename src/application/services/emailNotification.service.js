class EmailNotificationService {
  sendEmail(message) {
    return { success: true, message };
  }
}

module.exports = new EmailNotificationService();
