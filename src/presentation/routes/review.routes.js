const express = require('express');
const { submitReview, getProductReviews } = require('../controllers/review.controller');
const { voteReview } = require('../controllers/reviewVote.controller');
const router = express.Router();

router.post('/', submitReview);
router.get('/product/:productId', getProductReviews);
router.post('/:reviewId/helpful', voteReview);

module.exports = router;
