const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  vendorId: mongoose.Schema.Types.ObjectId,
  orderId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  commissionRate: Number,
  commissionAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Commission', commissionSchema);
