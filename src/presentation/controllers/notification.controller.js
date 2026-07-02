const notificationService = require('../../application/services/notification.service');

exports.createNotification = async (req, res, next) => {
  try {
    const result = await notificationService.sendNotification(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const recipientId = req.params.recipientId || req.query.recipientId || 'system';
    const result = await notificationService.getNotifications(recipientId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
