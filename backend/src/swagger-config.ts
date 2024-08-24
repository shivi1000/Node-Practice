import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger Express API',
      version: '1.0.0',
      description: 'A simple Express API with Swagger documentation - Node-Practice',
    },
    servers: [
      {
        "url": "http://localhost:8008/api-docs/"
      }
    ],
    components: {
      securitySchemas: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      }
    ]
  },
  apis: ['./routes/user.routes.js', './models/user.model.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;