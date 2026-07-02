const express = require('express');
const { handleWebhook } = require('../controllers/paymentWebhook.controller');
const router = express.Router();

router.post('/', handleWebhook);

module.exports = router;
