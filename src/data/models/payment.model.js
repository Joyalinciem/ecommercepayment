const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Net Banking', 'Wallet'] },
  status: { type: String, enum: ['pending', 'expired', 'paid', 'failed'], default: 'pending' },
  gatewayReference: String,
  qrCode: { type: String }, // Base64 encoded QR code
  gatewayConfirmed: { type: Boolean, default: false },
  razorpayOrderId: { type: String },
  expiresAt: Date, // Payment expiry time (5 min for UPI/UPI ID, 10 min for Card)
  retryAvailableAt: Date, // When user can retry (2 min freeze for UPI)
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  freezePeriodMinutes: { type: Number, default: 0 }, // 2 for UPI, 0 for others
  paymentDetails: {
    cardNumber: String, // Last 4 digits only in production
    cardHolderName: String,
    expiryMonth: String,
    expiryYear: String,
    upiId: String,
  },
  amountVerified: { type: Boolean, default: false },
  verificationCode: String, // For payment verification
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: Date,
});

paymentSchema.index({ userId: 1, orderId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
