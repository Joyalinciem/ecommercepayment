const Commission = require('../models/commission.model');

class CommissionRepository {
  create(record) {
    return Commission.create(record);
  }
}

module.exports = new CommissionRepository();
