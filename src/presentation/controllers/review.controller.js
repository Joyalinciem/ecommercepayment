const reviewService = require('../../application/services/review.service');

exports.submitReview = async (req, res, next) => {
  try {
    const result = await reviewService.submitReview(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(req.params.productId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
