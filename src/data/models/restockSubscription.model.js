const mongoose = require('mongoose');

const restockSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('RestockSubscription', restockSubscriptionSchema);
