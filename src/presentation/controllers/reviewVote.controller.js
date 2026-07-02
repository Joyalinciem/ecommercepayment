const reviewVoteService = require('../../application/services/reviewVote.service');

exports.voteReview = async (req, res, next) => {
  try {
    const result = await reviewVoteService.addVote(req.params.reviewId, req.body.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
