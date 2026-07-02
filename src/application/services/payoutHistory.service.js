class PayoutHistoryService {
  getPayoutHistory(vendorId) {
    return { vendorId, payouts: [] };
  }
}

module.exports = new PayoutHistoryService();
