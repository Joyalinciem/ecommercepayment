const mongoose = require('mongoose');

const reviewVoteSchema = new mongoose.Schema({
  reviewId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReviewVote', reviewVoteSchema);
