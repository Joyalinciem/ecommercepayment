const paymentRepository = require('../../data/repository/payment.repository');
const razorpayHelper = require('../../helper/razorpayHelper');
const razorpayConfig = require('../../config/razorpay.config');
const { toRazorpayAmountInPaise } = require('../../helper/amountHelper');

class PaymentService {
  async createOrder(payload) {
    const amountInPaise = toRazorpayAmountInPaise(payload.amount || 4999);
    const currency = payload.currency || 'INR';

    if (!razorpayConfig.keyId || razorpayConfig.keyId.includes('rzp_test_xxx')) {
      throw new Error('Razorpay key ID is not configured. Set RAZORPAY_KEY_ID in .env.');
    }

    if (!razorpayConfig.keySecret || razorpayConfig.keySecret.includes('rzp_test_xxx')) {
      throw new Error('Razorpay secret key is not configured. Set RAZORPAY_KEY_SECRET in .env.');
    }

    const orderPayload = {
      amount: amountInPaise,
      currency,
      receipt: payload.receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: payload.notes || {},
    };

    const order = await razorpayHelper.createOrder(orderPayload);

    await paymentRepository.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: 'razorpay',
      status: 'created',
      gatewayReference: order.id,
      createdAt: new Date(),
    });

    return {
      order,
      razorpayKeyId: razorpayConfig.keyId,
      mockMode: false,
    };
  }
}

module.exports = new PaymentService();
