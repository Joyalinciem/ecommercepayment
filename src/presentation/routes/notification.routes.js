const express = require('express');
const { createNotification, getNotifications } = require('../controllers/notification.controller');
const { subscribeNotificationStream } = require('../controllers/sse.controller');
const router = express.Router();

router.post('/', createNotification);
router.get('/vendor/:recipientId', getNotifications);
router.get('/vendor/:recipientId/stream', subscribeNotificationStream);

module.exports = router;
