const logger = require('../../helper/loggerHelper');

module.exports = function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
