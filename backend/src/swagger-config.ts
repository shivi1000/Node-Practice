import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger Express API',
      version: '1.0.0',
      description: 'A simple Express API with Swagger documentation- Shivani',
    },
  },
  apis: [ './routes/user.routes.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };