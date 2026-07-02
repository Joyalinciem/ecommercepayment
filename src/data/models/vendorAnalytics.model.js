const mongoose = require('mongoose');

const vendorAnalyticsSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  metrics: { type: Object, default: {} },
  generatedAt: { type: Date, default: Date.now },
});

vendorAnalyticsSchema.index({ vendorId: 1 });

module.exports = mongoose.model('VendorAnalytics', vendorAnalyticsSchema);
