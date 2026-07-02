const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: String, default: '' },
  customerId: { type: String, default: '' },
  orderId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  body: String,
  images: [String],
  helpfulVotes: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Review', reviewSchema);
