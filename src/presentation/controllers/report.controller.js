const reportService = require('../../application/services/report.service');

exports.generateReport = async (req, res, next) => {
  try {
    const result = await reportService.generateReport(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
