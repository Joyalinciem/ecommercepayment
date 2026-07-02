const restockRepository = require('../../data/repository/restockSubscription.repository');

class RestockSubscriptionService {
  async subscribe(payload) {
    return restockRepository.create({
      userId: payload.userId,
      productId: payload.productId,
      variantId: payload.variantId,
      notified: false,
    });
  }

  async processRestockNotifications() {
    const subscriptions = await restockRepository.findPending();
    return subscriptions;
  }

  async markNotified(id) {
    return restockRepository.markNotified(id);
  }
}

module.exports = new RestockSubscriptionService();
