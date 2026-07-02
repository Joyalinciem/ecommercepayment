const express = require('express');
const { generateReport } = require('../controllers/report.controller');
const router = express.Router();

router.post('/', generateReport);

module.exports = router;
