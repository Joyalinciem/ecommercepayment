const Review = require('../models/review.model');

class ReviewRepository {
  create(review) {
    return Review.create(review);
  }

  findByProductId(productId) {
    return Review.find({ productId, isApproved: true }).sort({ createdAt: -1 });
  }

  findByOrderId(orderId) {
    return Review.find({ orderId }).sort({ createdAt: -1 });
  }

  findFlagged() {
    return Review.find({ isFlagged: true }).sort({ createdAt: -1 });
  }

  updateById(reviewId, update) {
    return Review.findByIdAndUpdate(reviewId, { ...update, updatedAt: new Date() }, { new: true });
  }
}

module.exports = new ReviewRepository();
