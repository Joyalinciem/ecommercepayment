class ReviewVoteService {
  addVote(reviewId, userId) {
    return { reviewId, userId, voted: true };
  }
}

module.exports = new ReviewVoteService();
