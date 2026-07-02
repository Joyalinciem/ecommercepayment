const VendorAnalytics = require('../models/vendorAnalytics.model');

class VendorDashboardRepository {
  getByVendor(vendorId) {
    return VendorAnalytics.findOne({ vendorId });
  }
}

module.exports = new VendorDashboardRepository();
