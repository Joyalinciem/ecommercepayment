const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerSpec');
const apiRoutes = require('./routes/api.routes');
const errorHandler = require('./presentation/middleware/error.middleware');

const app = express();

app.use(cors());
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve frontend static files first
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRoutes);

// Fallback to index.html for client-side routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.use(errorHandler);

module.exports = app;

