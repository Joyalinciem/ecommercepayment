const vendorDashboardService = require('../../application/services/vendorDashboard.service');

exports.getOverview = async (req, res, next) => {
  try {
    const vendorId = req.params.vendorId;
    const result = await vendorDashboardService.getOverview(vendorId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
