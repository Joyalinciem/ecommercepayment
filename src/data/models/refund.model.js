const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String },
  vendorId: { type: String, default: 'vendor-demo' },
  userId: String,
  amount: { type: Number, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'failed'], default: 'pending' },
  approvedBy: String,
  approvedAt: Date,
  processedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Refund', refundSchema);
