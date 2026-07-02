const express = require('express');
const { createSubscription, getPendingSubscriptions } = require('../controllers/restockSubscription.controller');
const router = express.Router();

router.post('/', createSubscription);
router.get('/pending', getPendingSubscriptions);

module.exports = router;
