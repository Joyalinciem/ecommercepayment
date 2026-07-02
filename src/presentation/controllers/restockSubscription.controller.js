const restockSubscriptionService = require('../../application/services/restockSubscription.service');

exports.createSubscription = async (req, res, next) => {
  try {
    const subscription = await restockSubscriptionService.subscribe(req.body);
    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
};

exports.getPendingSubscriptions = async (req, res, next) => {
  try {
    const result = await restockSubscriptionService.processRestockNotifications();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
