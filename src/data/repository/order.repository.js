const Order = require('../models/order.model');

class OrderRepository {
  async create(order) {
    return Order.create(order);
  }

  async findByOrderId(orderId) {
    return Order.findOne({ orderId });
  }

  async findByUserId(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 });
  }

  async updateByOrderId(orderId, update) {
    return Order.findOneAndUpdate({ orderId }, { ...update, updatedAt: new Date() }, { new: true });
  }

  async findByPaymentId(paymentId) {
    return Order.findOne({ paymentId });
  }

  async updatePaymentStatus(orderId, paymentId, status) {
    return Order.findOneAndUpdate(
      { orderId },
      { paymentId, paymentStatus: status, status: status === 'completed' ? 'payment_confirmed' : 'pending', updatedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new OrderRepository();
