module.exports = {
  emailTemplateBaseUrl: process.env.EMAIL_TEMPLATE_BASE_URL || '',
  webhookSecret: process.env.NOTIFICATION_WEBHOOK_SECRET || 'notification-secret',
  restockCollection: process.env.RESTOCK_SUBSCRIPTION_COLLECTION || 'restocksubscriptions',
};
