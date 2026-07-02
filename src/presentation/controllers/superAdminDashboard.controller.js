const superAdminDashboardService = require('../../application/services/superAdminDashboard.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const result = await superAdminDashboardService.getMetrics();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getTopSellers = async (req, res, next) => {
  try {
    const result = await superAdminDashboardService.getTopSellers();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
