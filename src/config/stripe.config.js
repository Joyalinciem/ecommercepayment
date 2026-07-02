module.exports = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_xxx',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_xxx',
};
