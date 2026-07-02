function buildTopProducts(sales = [], limit = 5) {
  const byProduct = new Map();

  for (const sale of sales) {
    const productName = sale.productName || 'General Product';
    const existing = byProduct.get(productName) || { productName, salesCount: 0, revenue: 0 };
    existing.salesCount += 1;
    existing.revenue += Number(sale.amount || 0);
    byProduct.set(productName, existing);
  }

  return Array.from(byProduct.values())
    .sort((a, b) => (b.salesCount - a.salesCount) || (b.revenue - a.revenue))
    .slice(0, limit);
}

function aggregateRefundStats(refunds = []) {
  let totalRequests = 0;
  let approvedCount = 0;
  let totalRefundAmount = 0;

  for (const refund of refunds) {
    totalRequests += 1;
    if (refund.status === 'approved' || refund.status === 'completed') {
      approvedCount += 1;
    }
    if (refund.status !== 'rejected') {
      totalRefundAmount += Number(refund.amount || 0);
    }
  }

  return { totalRequests, approvedCount, totalRefundAmount };
}

function buildSellerPerformance(orders = []) {
  const sellers = new Map();

  for (const order of orders) {
    const sellerId = order.sellerId || order.vendorId || 'default-seller';
    const existing = sellers.get(sellerId) || {
      sellerId,
      totalOrders: 0,
      deliveredOnTime: 0,
      totalEarned: 0,
    };
    existing.totalOrders += 1;
    existing.totalEarned += Number(order.amount || 0);
    if (order.status === 'delivered') {
      const isOnTime = order.deliveryDate && order.expectedDeliveryDate
        ? new Date(order.deliveryDate) <= new Date(order.expectedDeliveryDate)
        : true;
      if (isOnTime) existing.deliveredOnTime += 1;
    }
    sellers.set(sellerId, existing);
  }

  return Array.from(sellers.values());
}

module.exports = {
  buildTopProducts,
  aggregateRefundStats,
  buildSellerPerformance,
};
