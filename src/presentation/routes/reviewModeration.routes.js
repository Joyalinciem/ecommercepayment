const express = require('express');
const { flagReview, approveReview, rejectReview, getFlaggedReviews } = require('../controllers/reviewModeration.controller');
const { subscribeReviewModerationStream } = require('../controllers/sse.controller');
const router = express.Router();

router.get('/stream', subscribeReviewModerationStream);
router.get('/pending', getFlaggedReviews);
router.post('/:reviewId/flag', flagReview);
router.post('/:reviewId/approve', approveReview);
router.post('/:reviewId/reject', rejectReview);

module.exports = router;
