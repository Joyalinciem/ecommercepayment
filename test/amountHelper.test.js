const test = require('node:test');
const assert = require('node:assert/strict');
const { toRazorpayAmountInPaise, toDisplayAmountInRupees } = require('../src/helper/amountHelper');

test('converts rupee decimals to Razorpay paise with rounding', () => {
  assert.equal(toRazorpayAmountInPaise(140.87), 14087);
  assert.equal(toRazorpayAmountInPaise('19.99'), 1999);
  assert.equal(toRazorpayAmountInPaise(10.005), 1001);
});

test('converts paise back to rupees for display', () => {
  assert.equal(toDisplayAmountInRupees(14087), 140.87);
  assert.equal(toDisplayAmountInRupees(1999), 19.99);
});
