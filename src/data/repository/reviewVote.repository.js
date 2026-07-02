const ReviewVote = require('../models/reviewVote.model');

class ReviewVoteRepository {
  create(vote) {
    return ReviewVote.create(vote);
  }
}

module.exports = new ReviewVoteRepository();
