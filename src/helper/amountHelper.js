function toRazorpayAmountInPaise(amount) {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    throw new Error('Invalid amount value');
  }

  return Math.round(numericAmount * 100);
}

function toDisplayAmountInRupees(amountInPaise) {
  const numericAmount = Number(amountInPaise);

  if (Number.isNaN(numericAmount)) {
    throw new Error('Invalid paise amount value');
  }

  return Number((numericAmount / 100).toFixed(2));
}

module.exports = {
  toRazorpayAmountInPaise,
  toDisplayAmountInRupees,
};
