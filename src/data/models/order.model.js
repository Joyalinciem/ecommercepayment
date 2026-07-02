const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  vendorId: { type: String, default: 'vendor-demo' },
  sellerId: { type: String, default: 'vendor-demo' },
  productName: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  deliveryAddress: String,
  expectedDeliveryDate: Date,
  deliveryDate: Date,
  createdAt: { type: Date, default: Date.now },
  paymentConfirmedAt: Date,
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.index({ userId: 1, orderId: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
