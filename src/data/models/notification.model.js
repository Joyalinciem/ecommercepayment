const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true },
  type: String,
  title: String,
  message: String,
  metadata: Object,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
