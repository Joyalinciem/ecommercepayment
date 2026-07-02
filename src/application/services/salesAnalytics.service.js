const Order = require('../../data/models/order.model');
const VendorAnalytics = require('../../data/models/vendorAnalytics.model');

class SalesAnalyticsService {
  async getSalesChart(vendorId) {
    const normalizedVendorId = vendorId || 'vendor-demo';
    const analytics = await VendorAnalytics.findOne({ vendorId: normalizedVendorId });
    const sales = analytics?.metrics?.sales || [];
    const fallbackOrders = await Order.find({ paymentStatus: 'completed' }).sort({ createdAt: 1 }).limit(30);

    const dayMap = new Map();
    for (const entry of sales) {
      const date = entry.at ? new Date(entry.at) : new Date();
      const key = date.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + (Number(entry.amount) || 0));
    }

    for (const order of fallbackOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + (Number(order.amount) || 0));
    }

    const data = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      data.push({
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        value: Math.round(dayMap.get(key) || 0),
      });
    }

    return { vendorId: normalizedVendorId, data };
  }
}

module.exports = new SalesAnalyticsService();
