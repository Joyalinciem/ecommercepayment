const mongoose = require('mongoose');

const vendorRequestSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  gstNumber: { type: String, required: true },
  businessLicenseUrl: { type: String },
  identityProofUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  vendorId: { type: String },
  notes: { type: String },
  rejectionReason: { type: String },
  reviewedBy: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
});

vendorRequestSchema.index({ status: 1 });

module.exports = mongoose.model('VendorRequest', vendorRequestSchema);
