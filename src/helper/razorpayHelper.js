const Razorpay = require('razorpay');
const config = require('../config/razorpay.config');

const razorpay = new Razorpay({
  key_id: config.keyId,
  key_secret: config.keySecret,
});

module.exports = {
  createOrder: (options) => razorpay.orders.create(options),
  verifySignature: (body, signature, secret) => {
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expected === signature;
  },
};
