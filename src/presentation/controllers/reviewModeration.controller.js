const reviewModerationService = require('../../application/services/reviewModeration.service');

exports.flagReview = async (req, res, next) => {
  try {
    const result = await reviewModerationService.flagReview(req.params.reviewId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    const result = await reviewModerationService.approveReview(req.params.reviewId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.rejectReview = async (req, res, next) => {
  try {
    const result = await reviewModerationService.rejectReview(req.params.reviewId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getFlaggedReviews = async (req, res, next) => {
  try {
    const result = await reviewModerationService.getFlaggedReviews();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
