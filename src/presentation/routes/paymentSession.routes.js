const express = require('express');
const {
  initiatePayment,
  verifyAmount,
  completePayment,
  getPaymentStatus,
  requestRetry,
  failPayment,
  razorpayWebhook,
} = require('../controllers/paymentSession.controller');
const bodyParser = require('body-parser');

const router = express.Router();

// Initiate a new payment session
router.post('/initiate', initiatePayment);

// Verify payment amount
router.post('/verify-amount', verifyAmount);

// Complete payment
router.post('/complete', completePayment);

// Razorpay webhook (raw body required for signature verification)
router.post('/webhook/razorpay', bodyParser.raw({ type: 'application/json' }), razorpayWebhook);

// Get payment status
router.get('/status/:paymentId', getPaymentStatus);

// Request retry after expiry
router.post('/retry', requestRetry);

// Mark payment as failed
router.post('/fail', failPayment);

module.exports = router;
