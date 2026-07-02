const express = require('express');
const { getOverview } = require('../controllers/vendorDashboard.controller');
const { subscribeVendorOverviewStream } = require('../controllers/sse.controller');
const router = express.Router();

router.get('/:vendorId/overview', getOverview);
router.get('/:vendorId/overview/stream', subscribeVendorOverviewStream);

module.exports = router;
