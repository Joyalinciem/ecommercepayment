const express = require('express');
const { getPendingRequests, approveRequest, rejectRequest } = require('../controllers/vendorRequest.controller');
const router = express.Router();

router.get('/pending', getPendingRequests);
router.post('/:requestId/approve', approveRequest);
router.post('/:requestId/reject', rejectRequest);

module.exports = router;
