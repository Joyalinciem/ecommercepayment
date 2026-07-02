const mongoose = require('mongoose');
const logger = require('../helper/loggerHelper');

module.exports = async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce';

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  logger.info('Connected to MongoDB');
};
