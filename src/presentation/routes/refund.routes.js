const express = require('express');
const { initiateRefund } = require('../controllers/refund.controller');
const router = express.Router();

router.post('/:orderId', initiateRefund);

module.exports = router;
