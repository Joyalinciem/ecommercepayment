const Refund = require('../models/refund.model');

class RefundRepository {
  create(refund) {
    return Refund.create(refund);
  }

  findById(id) {
    return Refund.findById(id);
  }

  findByVendor(vendorId) {
    return Refund.find({ vendorId }).sort({ createdAt: -1 }).lean();
  }
}

module.exports = new RefundRepository();
