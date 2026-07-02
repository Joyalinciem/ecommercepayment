const VendorAnalytics = require('../../data/models/vendorAnalytics.model');
const Order = require('../../data/models/order.model');
const Payout = require('../../data/models/payout.model');
const Refund = require('../../data/models/refund.model');
const notificationService = require('./notification.service');
const sseService = require('./sse.service');
const { buildTopProducts, aggregateRefundStats, buildSellerPerformance } = require('../../helper/vendorDashboardHelper');

class VendorDashboardService {
  async getOverview(vendorId) {
    const normalizedVendorId = vendorId || 'vendor-demo';
    const analytics = await VendorAnalytics.findOne({ vendorId: normalizedVendorId });
    const sales = analytics?.metrics?.sales || [];

    const totalSales = sales.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const payouts = await Payout.find({ vendorId: normalizedVendorId }).lean();
    const payoutHistory = payouts.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

    const refunds = await Refund.find({ vendorId: normalizedVendorId }).lean();
    const refundStats = aggregateRefundStats(refunds);

    const orders = await Order.find().lean();
    const sellerPerformance = buildSellerPerformance(orders);
    const currentSellerStats = sellerPerformance.find(s => s.sellerId === normalizedVendorId) || {};

    return {
      vendorId: normalizedVendorId,
      totalSales,
      pendingOrders,
      payoutHistory,
      payoutCount: payouts.length,
      sales,
      topProducts: buildTopProducts(sales, 5),
      refundStats,
      sellerPerformance: currentSellerStats,
      lowStockAlerts: [],
    };
  }

  async recordSale({ vendorId, orderId, paymentId, amount }) {
    try {
      const normalizedVendorId = vendorId || 'vendor-demo';

      await notificationService.sendNotification({
        recipientId: normalizedVendorId,
        vendorId: normalizedVendorId,
        type: 'vendor_payment_received',
        title: 'Payment received',
        message: `Payment received for order ${orderId}. Amount: ₹${amount}`,
        meta: { paymentId, orderId },
      });

      const order = await Order.findOne({ orderId });
      const analytics = await VendorAnalytics.findOne({ vendorId: normalizedVendorId }) || new VendorAnalytics({ vendorId: normalizedVendorId });
      const metrics = analytics.metrics || {};
      const sales = Array.isArray(metrics.sales) ? metrics.sales : [];
      sales.push({
        orderId,
        paymentId,
        amount,
        productName: order?.productName || 'General Product',
        at: new Date(),
      });
      analytics.metrics = { ...metrics, sales };
      analytics.generatedAt = new Date();
      await analytics.save();

      const totalSales = sales.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
      sseService.publish('vendorOverview', normalizedVendorId, 'vendorUpdate', {
        vendorId: normalizedVendorId,
        orderId,
        amount,
        totalSales,
      });

      return { success: true, vendorId: normalizedVendorId };
    } catch (err) {
      console.warn('Vendor recordSale failed:', err.message);
      return { success: false };
    }
  }
}

module.exports = new VendorDashboardService();
