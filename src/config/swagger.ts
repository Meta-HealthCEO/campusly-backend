import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campusly API',
      version: '1.0.0',
      description: 'API documentation for the Campusly school management system',
    },
    servers: [
      {
        url: config.app.url,
        description: config.nodeEnv === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['src/modules/**/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
