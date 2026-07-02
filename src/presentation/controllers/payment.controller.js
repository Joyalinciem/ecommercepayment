const paymentService = require('../../application/services/payment.service');

exports.createOrder = async (req, res, next) => {
  try {
    const result = await paymentService.createOrder(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
