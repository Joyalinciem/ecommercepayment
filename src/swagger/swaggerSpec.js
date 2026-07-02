const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Marketplace API',
      version: '1.0.0',
      description: 'API documentation for payments, reviews, notifications, and dashboards',
    },
    servers: [
      {
        url: 'http://localhost:9000/api',
      },
    ],
  },
  apis: ['./src/swagger/*.js', './src/presentation/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
