const express = require('express');
const paymentRoutes = require('../presentation/routes/payment.routes');
const paymentSessionRoutes = require('../presentation/routes/paymentSession.routes');
const webhookRoutes = require('../presentation/routes/webhook.routes');
const refundRoutes = require('../presentation/routes/refund.routes');
const reviewRoutes = require('../presentation/routes/review.routes');
const reviewModerationRoutes = require('../presentation/routes/reviewModeration.routes');
const notificationRoutes = require('../presentation/routes/notification.routes');
const superAdminRoutes = require('../presentation/routes/superAdminDashboard.routes');
const vendorDashboardRoutes = require('../presentation/routes/vendorDashboard.routes');
const analyticsRoutes = require('../presentation/routes/analytics.routes');
const restockSubscriptionRoutes = require('../presentation/routes/restockSubscription.routes');
const payoutRoutes = require('../presentation/routes/payout.routes');
const reportRoutes = require('../presentation/routes/report.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce Marketplace API root is running.',
    availableRoutes: [
      '/payments',
      '/payment-sessions',
      '/webhooks',
      '/refunds',
      '/reviews',
      '/review-moderation',
      '/notifications',
      '/restock-subscriptions',
      '/admin',
      '/vendor',
      '/analytics',
      '/payouts',
      '/reports',
    ],
  });
});

router.use('/payments', paymentRoutes);
router.use('/payment-sessions', paymentSessionRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/refunds', refundRoutes);
router.use('/reviews', reviewRoutes);
router.use('/review-moderation', reviewModerationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/restock-subscriptions', restockSubscriptionRoutes);
router.use('/admin', superAdminRoutes);
router.use('/vendor', vendorDashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payouts', payoutRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
