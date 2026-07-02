const Payment = require('../models/payment.model');

class PaymentRepository {
  async create(payment) {
    return Payment.create(payment);
  }

  async findByOrderId(orderId) {
    return Payment.findOne({ orderId });
  }

  async findByPaymentId(paymentId) {
    return Payment.findOne({ paymentId });
  }

  async findByUserId(userId) {
    return Payment.find({ userId }).sort({ createdAt: -1 });
  }

  async updateByOrderId(orderId, update) {
    return Payment.findOneAndUpdate({ orderId }, { ...update, updatedAt: new Date() }, { new: true });
  }

  async updateByPaymentId(paymentId, update) {
    return Payment.findOneAndUpdate({ paymentId }, { ...update, updatedAt: new Date() }, { new: true });
  }

  async findExpiredPayments() {
    return Payment.find({ status: 'pending', expiresAt: { $lt: new Date() } });
  }

  async findRetryAvailablePayments() {
    return Payment.find({
      status: 'expired',
      retryAvailableAt: { $lte: new Date() },
      retryCount: { $lt: 3 },
    });
  }

  async findByPaymentGatewayOrderId(orderId) {
    return Payment.findOne({
      $or: [
        { 'paymentDetails.gateway.order_id': orderId },
        { razorpayOrderId: orderId },
      ],
    });
  }
}

module.exports = new PaymentRepository();
