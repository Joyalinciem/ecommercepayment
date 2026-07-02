const express = require('express');
const { getDashboard, getTopSellers } = require('../controllers/superAdminDashboard.controller');
const vendorRequestRoutes = require('../routes/vendorRequest.routes');
const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/top-sellers', getTopSellers);
router.use('/vendor-requests', vendorRequestRoutes);

module.exports = router;
