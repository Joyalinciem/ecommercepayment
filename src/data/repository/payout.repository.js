const Payout = require('../models/payout.model');

class PayoutRepository {
  create(entry) {
    return Payout.create(entry);
  }
}

module.exports = new PayoutRepository();
