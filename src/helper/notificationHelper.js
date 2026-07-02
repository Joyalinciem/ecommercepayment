const notificationConfig = require('../config/notification.config');

module.exports = {
  buildNotification: ({ recipientId, type, title, message, metadata }) => ({
    recipientId,
    type,
    title,
    message,
    metadata,
    isRead: false,
    createdAt: new Date(),
  }),
  getChangeStreamEvent: (doc) => ({
    collection: notificationConfig.restockCollection,
    payload: doc,
  }),
};
