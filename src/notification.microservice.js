const mongoose = require('mongoose');
const connectDatabase = require('./config/db.config');
const restockSubscriptionService = require('./application/services/restockSubscription.service');
const logger = require('./helper/loggerHelper');

async function run() {
  await connectDatabase();

  logger.info('Notification microservice started');

  // Example of scheduled processing for restock subscriptions.
  setInterval(async () => {
    try {
      const pending = await restockSubscriptionService.processRestockNotifications();
      if (pending.length) {
        logger.info('Pending restock subscriptions found', { count: pending.length });
        for (const subscription of pending) {
          // Send notification through your notification pipeline.
          logger.info('Restock subscription ready', { subscriptionId: subscription._id });
          await restockSubscriptionService.markNotified(subscription._id);
        }
      }
    } catch (err) {
      logger.error('Restock notification processor failed', err);
    }
  }, 5 * 60 * 1000);
}

run().catch((err) => {
  logger.error('Notification microservice failed', err);
  process.exit(1);
});
