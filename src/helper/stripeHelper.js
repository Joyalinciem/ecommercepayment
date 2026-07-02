const Stripe = require('stripe');
const config = require('../config/stripe.config');

const stripe = new Stripe(config.secretKey, { apiVersion: '2023-08-16' });

module.exports = {
  createPaymentIntent: (data) => stripe.paymentIntents.create(data),
  retrievePayment: (paymentId) => stripe.paymentIntents.retrieve(paymentId),
};
