const Order = require('../../data/models/order.model');
const VendorAnalytics = require('../../data/models/vendorAnalytics.model');

class RevenueChartService {
  async getRevenueSeries() {
    const analyticsDocs = await VendorAnalytics.find({}).lean();
    const monthMap = new Map();

    for (const doc of analyticsDocs) {
      const sales = Array.isArray(doc.metrics?.sales) ? doc.metrics.sales : [];
      for (const sale of sales) {
        const date = sale.at ? new Date(sale.at) : new Date();
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) || 0) + (Number(sale.amount) || 0));
      }
    }

    const fallbackOrders = await Order.find({ paymentStatus: 'completed' }).sort({ createdAt: 1 }).limit(60);
    for (const order of fallbackOrders) {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + (Number(order.amount) || 0));
    }

    const series = [];
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      series.push({
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        value: Math.round(monthMap.get(key) || 0),
      });
    }

    return { series };
  }
}

module.exports = new RevenueChartService();
