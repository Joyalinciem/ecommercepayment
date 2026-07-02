const paymentSessionService = require('../../application/services/paymentSession.service');
const paymentRepository = require('../../data/repository/payment.repository');
const paymentService = paymentSessionService; // alias
const razorpayConfig = require('../../../config/razorpay.config');
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Initiate a new payment session with time limit and QR code
exports.initiatePayment = async (req, res, next) => {
  try {
    const { userId, orderId, amount, paymentMethod, productName } = req.body;

    if (!userId || !orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, orderId, amount, paymentMethod',
      });
    }

    if (!['UPI', 'Card', 'Net Banking', 'Wallet'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const result = await paymentSessionService.initiatePaymentSession(
      userId,
      orderId,
      amount,
      paymentMethod,
      productName
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Verify the amount before processing payment
exports.verifyAmount = async (req, res, next) => {
  try {
    const { paymentId, paidAmount, userId } = req.body;

    if (!paymentId || paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, paidAmount',
      });
    }

    // Verify user owns this payment
    const payment = await paymentRepository.findByPaymentId(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const result = await paymentSessionService.verifyPaymentAmount(paymentId, paidAmount);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Complete payment after user has paid
exports.completePayment = async (req, res, next) => {
  try {
    const { paymentId, paidAmount, userId, paymentDetails } = req.body;

    if (!paymentId || paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, paidAmount',
      });
    }

    // Verify user owns this payment
    const payment = await paymentRepository.findByPaymentId(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    if (!payment.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway order was not created. Please retry or contact support.',
      });
    }

    // Update payment details if provided
    if (paymentDetails) {
      await paymentRepository.updateByPaymentId(paymentId, {
        paymentDetails: {
          cardNumber: paymentDetails.cardNumber ? `****${paymentDetails.cardNumber.slice(-4)}` : undefined,
          cardHolderName: paymentDetails.cardHolderName,
          expiryMonth: paymentDetails.expiryMonth,
          expiryYear: paymentDetails.expiryYear,
          upiId: paymentDetails.upiId,
        },
      });
    }

    // Enforce gateway verification: payment must have been confirmed by the payment gateway
    // either via webhook (payment.gatewayConfirmed === true) or by providing Razorpay
    // verification parameters here (razorpay_payment_id, razorpay_signature, razorpay_order_id).
    if (!payment.gatewayConfirmed) {
      const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = req.body;

      if (razorpay_payment_id && razorpay_signature && razorpay_order_id) {
        const secret = razorpayConfig.keySecret || process.env.RAZORPAY_KEY_SECRET;
        const generated = crypto
          .createHmac('sha256', secret || '')
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generated !== razorpay_signature) {
          return res.status(400).json({ success: false, message: 'Invalid Razorpay signature' });
        }

        if (payment.razorpayOrderId && payment.razorpayOrderId !== razorpay_order_id) {
          return res.status(400).json({ success: false, message: 'Razorpay order ID does not match this payment session.' });
        }

        if (!payment.razorpayOrderId) {
          await paymentRepository.updateByPaymentId(paymentId, { razorpayOrderId: razorpay_order_id });
        }

        await paymentSessionService.processGatewayConfirmation(paymentId, {
          provider: 'razorpay',
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: Math.round(paidAmount * 100),
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment cannot be completed without gateway verification. Provide Razorpay verification parameters or wait for webhook confirmation.',
        });
      }
    }

    const result = await paymentSessionService.completePayment(paymentId, paidAmount);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Payment completed successfully. Order confirmed.',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Razorpay webhook handler (uses raw body to verify signature)
exports.razorpayWebhook = async (req, res) => {
  try {
    // bodyParser.raw is applied at the route, so req.body is a Buffer
    const rawBody = req.body;
    const signature = req.headers['x-razorpay-signature'];
    const secret = razorpayConfig.webhookSecret || razorpayConfig.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return res.status(500).send('Webhook secret not configured');
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return res.status(400).send('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody.toString());

    // Handle payment captured event
    if (payload.event === 'payment.captured' && payload.payload && payload.payload.payment && payload.payload.payment.entity) {
      const entity = payload.payload.payment.entity;
      const razorpayOrderId = entity.order_id;
      const razorpayPaymentId = entity.id;
      const amount = entity.amount; // in paise

      // Find our payment by razorpayOrderId stored earlier (field: razorpayOrderId)
      const payment = await paymentRepository.findByPaymentGatewayOrderId(razorpayOrderId);
      if (!payment) {
        // If mapping not available, we could map by other means. For now respond ok.
        return res.status(200).send('No matching payment found');
      }

      // Process gateway confirmation (this will mark payment paid and update order)
      await paymentSessionService.processGatewayConfirmation(payment.paymentId, {
        provider: 'razorpay',
        payment_id: razorpayPaymentId,
        order_id: razorpayOrderId,
        amount,
      });
    }

    res.status(200).send('ok');
  } catch (err) {
    res.status(500).send('webhook processing failed');
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId } = req.query;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: paymentId, userId',
      });
    }

    const result = await paymentSessionService.getPaymentStatus(paymentId, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Request a retry after payment expires
exports.requestRetry = async (req, res, next) => {
  try {
    const { paymentId, userId } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, userId',
      });
    }

    // Verify user owns this payment
    const payment = await paymentRepository.findByPaymentId(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const result = await paymentSessionService.requestRetry(paymentId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Retry session created. You have a new time window to complete payment.',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Mark payment as failed
exports.failPayment = async (req, res, next) => {
  try {
    const { paymentId, userId, failureReason } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, userId',
      });
    }

    // Verify user owns this payment
    const payment = await paymentRepository.findByPaymentId(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    await paymentRepository.updateByPaymentId(paymentId, {
      status: 'failed',
    });

    res.status(200).json({
      success: true,
      message: 'Payment marked as failed. Please retry again.',
      retryAvailable: payment.retryCount < payment.maxRetries,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
