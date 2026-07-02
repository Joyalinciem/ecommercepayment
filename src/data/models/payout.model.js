const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  amount: Number,
  commissionAmount: Number,
  payoutDate: Date,
  status: String,
  transactionId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payout', payoutSchema);
