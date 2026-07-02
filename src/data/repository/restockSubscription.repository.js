const RestockSubscription = require('../models/restockSubscription.model');

class RestockSubscriptionRepository {
  create(subscription) {
    return RestockSubscription.create(subscription);
  }

  findPending() {
    return RestockSubscription.find({ notified: false });
  }

  markNotified(id) {
    return RestockSubscription.findByIdAndUpdate(id, { notified: true, updatedAt: new Date() }, { new: true });
  }
}

module.exports = new RestockSubscriptionRepository();
