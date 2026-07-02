const refundService = require('../../application/services/refund.service');

exports.initiateRefund = async (req, res, next) => {
  try {
    const result = await refundService.initiateRefund(req.params.orderId, req.body.amount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
