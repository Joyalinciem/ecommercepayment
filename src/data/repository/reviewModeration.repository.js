const ReviewFlag = require('../models/reviewFlag.model');

class ReviewModerationRepository {
  create(flag) {
    return ReviewFlag.create(flag);
  }
}

module.exports = new ReviewModerationRepository();
