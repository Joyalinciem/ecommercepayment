const sseService = require('../../application/services/sse.service');

const setupSSE = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
};

exports.subscribeNotificationStream = (req, res) => {
  setupSSE(req, res);
  const recipientId = req.params.recipientId || req.query.recipientId || 'system';
  sseService.subscribe('notification', recipientId, res);
};

exports.subscribeVendorOverviewStream = (req, res) => {
  setupSSE(req, res);
  const vendorId = req.params.vendorId || req.query.vendorId || 'vendor-demo';
  sseService.subscribe('vendorOverview', vendorId, res);
};

exports.subscribeReviewModerationStream = (req, res) => {
  setupSSE(req, res);
  sseService.subscribe('reviewModeration', 'admin', res);
};
