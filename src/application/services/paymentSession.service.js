const paymentRepository = require('../../data/repository/payment.repository');
const orderRepository = require('../../data/repository/order.repository');
const razorpayConfig = require('../../../config/razorpay.config');
const { toRazorpayAmountInPaise } = require('../../helper/amountHelper');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.keyId || process.env.RAZORPAY_KEY_ID,
  key_secret: razorpayConfig.keySecret || process.env.RAZORPAY_KEY_SECRET,
});

const PAYMENT_TIME_LIMITS = {
  UPI: 5 * 60 * 1000, // 5 minutes in milliseconds
  Card: 10 * 60 * 1000, // 10 minutes
  'Net Banking': 10 * 60 * 1000,
  Wallet: 5 * 60 * 1000,
};

const FREEZE_PERIOD = {
  UPI: 2 * 60 * 1000, // 2 minutes for UPI
  Card: 0, // No freeze for card
  'Net Banking': 0,
  Wallet: 0,
};

class PaymentSessionService {
  async initiatePaymentSession(userId, orderId, amount, paymentMethod, productName) {
    try {
      // Generate unique payment ID
      const paymentId = `PAY_${userId}_${orderId}_${Date.now()}`;
      const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

      // Calculate expiry time based on payment method
      const expiresAt = new Date(Date.now() + PAYMENT_TIME_LIMITS[paymentMethod]);

      // Create payment record
      const paymentData = {
        paymentId,
        orderId,
        userId,
        amount,
        paymentMethod,
        status: 'pending',
        expiresAt,
        freezePeriodMinutes: FREEZE_PERIOD[paymentMethod] / (60 * 1000),
        maxRetries: 3,
        retryCount: 0,
        verificationCode,
        amountVerified: false,
      };

      const payment = await paymentRepository.create(paymentData);

      // Create Razorpay order for all real gateway-backed payments.
      let razorpayOrder = null;
      let razorpayOrderError = null;

      try {
        const orderOptions = {
          amount: toRazorpayAmountInPaise(amount),
          currency: 'INR',
          receipt: paymentId,
          payment_capture: 1,
        };

        razorpayOrder = await razorpayInstance.orders.create(orderOptions);
        if (razorpayOrder && razorpayOrder.id) {
          await paymentRepository.updateByPaymentId(paymentId, { razorpayOrderId: razorpayOrder.id });
        }
      } catch (err) {
        razorpayOrderError = err.message;
        console.warn('Razorpay order creation failed:', err.message);
        throw new Error(`Unable to create Razorpay order${razorpayOrderError ? `: ${razorpayOrderError}` : ''}`);
      }

      // Create associated order
      const order = await orderRepository.create({
        orderId,
        userId,
        productName,
        amount,
        currency: 'INR',
        status: 'pending',
        paymentMethod,
      });

      return {
        success: true,
        paymentId,
        orderId,
        amount,
        currency: 'INR',
        paymentMethod,
        expiresAt,
        expiresIn: Math.floor((expiresAt - Date.now()) / 1000), // Seconds remaining
        qrCode: null,
        verificationCode,
        mockMode: false,
        retryCount: payment.retryCount,
        maxRetries: payment.maxRetries,
        razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
        razorpayKeyId: razorpayConfig.keyId || process.env.RAZORPAY_KEY_ID,
      };
    } catch (err) {
      throw new Error(`Failed to initiate payment session: ${err.message}`);
    }
  }

  async verifyPaymentAmount(paymentId, paidAmount) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        throw new Error(`Payment is already ${payment.status}`);
      }

      if (payment.expiresAt < new Date()) {
        await paymentRepository.updateByPaymentId(paymentId, { status: 'expired' });
        throw new Error('Payment session has expired');
      }

      if (Math.abs(payment.amount - paidAmount) > 0.01) {
        throw new Error(`Amount mismatch. Expected ${payment.amount}, got ${paidAmount}`);
      }

      return {
        success: true,
        amountVerified: true,
        amount: payment.amount,
        message: 'Amount verified successfully',
      };
    } catch (err) {
      throw new Error(`Amount verification failed: ${err.message}`);
    }
  }

  async completePayment(paymentId, paidAmount) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify amount
      if (Math.abs(payment.amount - paidAmount) > 0.01) {
        await paymentRepository.updateByPaymentId(paymentId, { status: 'failed' });
        throw new Error(`Payment amount mismatch. Expected ${payment.amount}, received ${paidAmount}`);
      }

      // IMPORTANT: Do not mark payment as 'paid' here unless gateway verification exists.
      // The `completePayment` method assumes that gateway verification has already occurred
      // (via webhook) and that payment.gatewayConfirmed is true. This prevents demo clients
      // from marking payments as paid without actual gateway confirmation.

      if (!payment.gatewayConfirmed) {
        throw new Error('Payment cannot be completed without gateway verification');
      }

      // Update payment status
      const updatedPayment = await paymentRepository.updateByPaymentId(paymentId, {
        status: 'paid',
        amountVerified: true,
        completedAt: new Date(),
      });

      // Update order status
      await orderRepository.updatePaymentStatus(payment.orderId, paymentId, 'completed');

      return {
        success: true,
        message: 'Payment successful',
        paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: 'paid',
      };
    } catch (err) {
      throw new Error(`Payment completion failed: ${err.message}`);
    }
  }

  // Verify Razorpay signature for order_id|payment_id
  verifyRazorpaySignature(orderId, paymentId, signature) {
    try {
      const secret = razorpayConfig.keySecret || process.env.RAZORPAY_KEY_SECRET;
      if (!secret) return false;
      const generated = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      return generated === signature;
    } catch (err) {
      return false;
    }
  }

  // Process gateway confirmation (used by webhook)
  async processGatewayConfirmation(paymentId, gatewayData = {}) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found for gateway confirmation');
      }

      if (gatewayData.order_id) {
        if (payment.razorpayOrderId && payment.razorpayOrderId !== gatewayData.order_id) {
          throw new Error('Gateway order ID does not match the stored payment session');
        }

        if (!payment.razorpayOrderId) {
          await paymentRepository.updateByPaymentId(paymentId, { razorpayOrderId: gatewayData.order_id });
        }
      }

      // Verify amount if gateway provided amount (Razorpay sends amount in paise)
      if (gatewayData.amount !== undefined) {
        const gatewayAmount = gatewayData.amount / 100; // convert paise to INR
        if (Math.abs(payment.amount - gatewayAmount) > 0.01) {
          await paymentRepository.updateByPaymentId(paymentId, { status: 'failed' });
          throw new Error('Gateway amount does not match order amount');
        }
      }

      // Mark payment as gateway confirmed and paid
      await paymentRepository.updateByPaymentId(paymentId, {
        gatewayConfirmed: true,
        status: 'paid',
        amountVerified: true,
        completedAt: new Date(),
        paymentDetails: Object.assign({}, payment.paymentDetails || {}, { gateway: gatewayData }),
      });

      // Update order status
      await orderRepository.updatePaymentStatus(payment.orderId, paymentId, 'completed');

      // Send notification to user (email/sms/in-app)
      try {
        const notificationService = require('./notification.service');
        await notificationService.sendNotification({
          userId: payment.userId,
          type: 'payment_success',
          message: `Payment received for order ${payment.orderId}. Amount: ₹${payment.amount}`,
          meta: { paymentId, orderId: payment.orderId },
        });
      } catch (notifyErr) {
        console.warn('Notification failed:', notifyErr.message);
      }

      // Notify vendor dashboard (attempt to derive vendorId from order if present)
      try {
        const vendorDashboardService = require('./vendorDashboard.service');
        const order = await orderRepository.findByOrderId(payment.orderId);
        const vendorId = order && order.vendorId ? order.vendorId : 'vendor-demo';
        await vendorDashboardService.recordSale({ vendorId, orderId: payment.orderId, paymentId, amount: payment.amount });
      } catch (vendorErr) {
        console.warn('Vendor notification failed:', vendorErr.message);
      }

      return { success: true, paymentId, orderId: payment.orderId };
    } catch (err) {
      throw new Error(`Gateway confirmation failed: ${err.message}`);
    }
  }

  async handlePaymentExpiry(paymentId) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'paid') {
        return { success: true, message: 'Payment already completed' };
      }

      if (payment.status === 'expired' || payment.status === 'failed') {
        return { success: true, message: 'Payment already expired or failed' };
      }

      if (payment.expiresAt > new Date()) {
        return { success: false, message: 'Payment has not expired yet' };
      }

      // Calculate retryAvailableAt based on freeze period for the method
      const freezeMs = FREEZE_PERIOD[payment.paymentMethod] || 0;
      const retryAvailableAt = freezeMs > 0 ? new Date(Date.now() + freezeMs) : new Date();

      // Mark as expired and persist retryAvailableAt
      await paymentRepository.updateByPaymentId(paymentId, {
        status: 'expired',
        retryAvailableAt,
      });

      return {
        success: true,
        message: 'Payment marked as expired',
        retryAvailable: payment.retryCount < payment.maxRetries,
        retryAvailableAt,
      };
    } catch (err) {
      throw new Error(`Payment expiry handling failed: ${err.message}`);
    }
  }

  async requestRetry(paymentId) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'expired') {
        throw new Error('Payment must be expired to retry');
      }

      if (payment.retryCount >= payment.maxRetries) {
        throw new Error(`Maximum retries (${payment.maxRetries}) exceeded`);
      }

      const freezeTime = FREEZE_PERIOD[payment.paymentMethod] || 0;
      const now = new Date();

      if (freezeTime > 0 && payment.retryAvailableAt && payment.retryAvailableAt > now) {
        const secondsToWait = Math.ceil((payment.retryAvailableAt - now) / 1000);
        throw new Error(`Please wait ${secondsToWait} seconds before retrying`);
      }

      // Create new payment session for retry
      const newPaymentId = `PAY_${payment.userId}_${payment.orderId}_${Date.now()}_RETRY${payment.retryCount + 1}`;
      const expiresAt = new Date(Date.now() + PAYMENT_TIME_LIMITS[payment.paymentMethod]);

      const newPayment = await paymentRepository.create({
        ...payment.toObject(),
        _id: undefined, // Remove old ID
        paymentId: newPaymentId,
        status: 'pending',
        expiresAt,
        retryAvailableAt: null,
        retryCount: payment.retryCount + 1,
      });

      // Mark old payment as part of retry chain
      await paymentRepository.updateByPaymentId(paymentId, {
        status: 'expired',
        retryAvailableAt: new Date(),
      });

      return {
        success: true,
        message: 'Retry initiated',
        newPaymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        expiresAt,
        expiresIn: Math.floor((expiresAt - Date.now()) / 1000),
        retryCount: payment.retryCount + 1,
      };
    } catch (err) {
      throw new Error(`Retry request failed: ${err.message}`);
    }
  }

  async getPaymentStatus(paymentId, userId) {
    try {
      const payment = await paymentRepository.findByPaymentId(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify user ownership
      if (payment.userId !== userId) {
        throw new Error('Unauthorized access to payment');
      }

      const isExpired = payment.status === 'pending' && payment.expiresAt < new Date();
      if (isExpired && payment.status === 'pending') {
        await paymentRepository.updateByPaymentId(paymentId, { status: 'expired' });
      }

      const order = await orderRepository.findByOrderId(payment.orderId);

      return {
        success: true,
        paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: isExpired ? 'expired' : payment.status,
        expiresAt: payment.expiresAt,
        expiresIn: Math.max(0, Math.floor((payment.expiresAt - Date.now()) / 1000)),
        retryCount: payment.retryCount,
        maxRetries: payment.maxRetries,
        retryAvailable: payment.retryCount < payment.maxRetries,
        retryAvailableAt: payment.retryAvailableAt,
        qrCode: payment.qrCode,
        order: order ? {
          orderId: order.orderId,
          productName: order.productName,
          status: order.status,
          paymentStatus: order.paymentStatus,
        } : null,
      };
    } catch (err) {
      throw new Error(`Failed to get payment status: ${err.message}`);
    }
  }
}

module.exports = new PaymentSessionService();
