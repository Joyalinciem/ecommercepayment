const express = require('express');
const { getPayoutHistory } = require('../controllers/payout.controller');
const router = express.Router();

router.get('/:vendorId', getPayoutHistory);

module.exports = router;
