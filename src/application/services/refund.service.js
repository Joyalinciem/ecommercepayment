const refundRepository = require('../../data/repository/refund.repository');
const orderRepository = require('../../data/repository/order.repository');

class RefundService {
  async initiateRefund(orderId, amount, reason = 'Customer request', vendorId = 'vendor-demo') {
    try {
      const order = await orderRepository.findByOrderId(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const refund = await refundRepository.create({
        orderId,
        paymentId: order.paymentId,
        vendorId,
        userId: order.userId,
        amount: Number(amount),
        reason,
        status: 'pending',
      });

      return { success: true, refund };
    } catch (err) {
      throw new Error(`Refund initiation failed: ${err.message}`);
    }
  }

  async approveRefund(refundId, approvedBy = 'admin') {
    try {
      const refund = await refundRepository.findById(refundId);
      if (!refund) {
        throw new Error('Refund not found');
      }

      refund.status = 'approved';
      refund.approvedBy = approvedBy;
      refund.approvedAt = new Date();
      await refund.save();

      return { success: true, refund };
    } catch (err) {
      throw new Error(`Refund approval failed: ${err.message}`);
    }
  }

  async getRefundsByVendor(vendorId) {
    try {
      const refunds = await refundRepository.findByVendor(vendorId);
      return refunds || [];
    } catch (err) {
      console.warn('Fetch refunds failed:', err.message);
      return [];
    }
  }
}

module.exports = new RefundService();
