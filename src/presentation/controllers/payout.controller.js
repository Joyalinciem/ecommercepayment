const payoutHistoryService = require('../../application/services/payoutHistory.service');

exports.getPayoutHistory = async (req, res, next) => {
  try {
    const result = await payoutHistoryService.getPayoutHistory(req.params.vendorId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
