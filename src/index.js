require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/db.config');
const logger = require('./helper/loggerHelper');

const PORT = process.env.PORT || 9000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Backend server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });
