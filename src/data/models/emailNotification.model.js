const mongoose = require('mongoose');

const emailNotificationSchema = new mongoose.Schema({
  recipientEmail: String,
  subject: String,
  body: String,
  template: String,
  status: String,
  sentAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailNotification', emailNotificationSchema);
