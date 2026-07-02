const commissionService = require('../../application/services/commission.service');

exports.calculate = async (req, res, next) => {
  try {
    const { amount, rate } = req.body;
    const commission = commissionService.calculateCommission(Number(amount), Number(rate));
    res.json({ success: true, data: { commission } });
  } catch (err) {
    next(err);
  }
};
