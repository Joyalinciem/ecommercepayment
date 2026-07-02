class CommissionService {
  calculateCommission(amount, rate = 5) {
    return (amount * rate) / 100;
  }
}

module.exports = new CommissionService();
