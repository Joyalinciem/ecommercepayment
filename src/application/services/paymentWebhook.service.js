const paymentRepository = require('../../data/repository/payment.repository');
const razorpayHelper = require('../../helper/razorpayHelper');
const razorpayConfig = require('../../config/razorpay.config');

class PaymentWebhookService {
  async processWebhook(rawBody, signature) {
    let event = rawBody;
    let bodyString = '';

    if (typeof rawBody === 'string') {
      bodyString = rawBody;
      event = JSON.parse(rawBody);
    } else if (Buffer.isBuffer(rawBody)) {
      bodyString = rawBody.toString('utf8');
      event = JSON.parse(bodyString);
    } else if (rawBody && typeof rawBody === 'object') {
      event = rawBody;
      bodyString = JSON.stringify(rawBody);
    }

    const valid = razorpayHelper.verifySignature(bodyString, signature, razorpayConfig.keySecret);
    if (!valid) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const payload = event.payload?.payment?.entity || event.payload?.order?.entity || event;
    const orderId = payload.orderId || payload.order_id || payload.id;
    const paymentId = payload.paymentId || payload.razorpay_payment_id || payload.id;
    const status = payload.status === 'captured' || payload.status === 'paid' || event.event === 'payment.captured' ? 'paid' : payload.status === 'failed' || event.event === 'payment.failed' ? 'failed' : 'pending';

    const payment = await paymentRepository.updateByOrderId(orderId, {
      status,
      paymentId,
      gatewayReference: paymentId,
      updatedAt: new Date(),
    });

    return {
      event: event.event || 'mock.payment.captured',
      valid: true,
      payment,
    };
  }
}

module.exports = new PaymentWebhookService();
