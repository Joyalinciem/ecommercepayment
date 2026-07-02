// Razorpay configuration placeholders.
// Replace with your real credentials in production via environment variables.
module.exports = {
  key_id: process.env.RAZORPAY_KEY_ID || 'RAZORPAY_KEY_ID_PLACEHOLDER',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'RAZORPAY_KEY_SECRET_PLACEHOLDER',
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || 'RAZORPAY_WEBHOOK_SECRET_PLACEHOLDER',
};
