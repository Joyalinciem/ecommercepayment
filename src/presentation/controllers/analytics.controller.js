const salesAnalyticsService = require('../../application/services/salesAnalytics.service');
const revenueChartService = require('../../application/services/revenueChart.service');

exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const result = await salesAnalyticsService.getSalesChart(req.params.vendorId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueChart = async (req, res, next) => {
  try {
    const result = await revenueChartService.getRevenueSeries();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
