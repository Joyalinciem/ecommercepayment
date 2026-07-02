const express = require('express');
const { getSalesAnalytics, getRevenueChart } = require('../controllers/analytics.controller');
const router = express.Router();

router.get('/vendor/:vendorId/sales', getSalesAnalytics);
router.get('/revenue', getRevenueChart);

module.exports = router;
