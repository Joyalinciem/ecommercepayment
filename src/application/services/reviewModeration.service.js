const Review = require('../../data/models/review.model');
const sseService = require('./sse.service');

class ReviewModerationService {
  async flagReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    review.isFlagged = true;
    review.isApproved = false;
    await review.save();
    sseService.publish('reviewModeration', 'admin', 'reviewModerationUpdate', {
      reviewId: review._id,
      status: 'flagged',
    });
    return review;
  }

  async approveReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    review.isFlagged = false;
    review.isApproved = true;
    await review.save();
    sseService.publish('reviewModeration', 'admin', 'reviewModerationUpdate', {
      reviewId: review._id,
      status: 'approved',
    });
    return review;
  }

  async rejectReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    review.isApproved = false;
    review.isFlagged = false;
    await review.save();
    sseService.publish('reviewModeration', 'admin', 'reviewModerationUpdate', {
      reviewId: review._id,
      status: 'rejected',
    });
    return review;
  }

  async getFlaggedReviews() {
    return Review.find({ isFlagged: true }).sort({ createdAt: -1 });
  }
}

module.exports = new ReviewModerationService();
