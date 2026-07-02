const vendorRequestService = require('../../application/services/vendorRequest.service');

exports.getPendingRequests = async (req, res, next) => {
  try {
    const result = await vendorRequestService.getPendingRequests();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const result = await vendorRequestService.approveRequest(req.params.requestId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const reason = req.body.reason || 'Application requires more information';
    const result = await vendorRequestService.rejectRequest(req.params.requestId, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
