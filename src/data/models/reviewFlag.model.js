const mongoose = require('mongoose');

const reviewFlagSchema = new mongoose.Schema({
  reviewId: mongoose.Schema.Types.ObjectId,
  flaggedBy: mongoose.Schema.Types.ObjectId,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReviewFlag', reviewFlagSchema);
