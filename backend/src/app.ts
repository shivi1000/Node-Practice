import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import BodyParser from 'body-parser';
import { router as userRouter } from './routes/user.routes.js';
import * as dotenv from "dotenv";
import { appConfig } from './common/appConfig.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errors as celebrateErrors } from 'celebrate';
//import { redisClient } from './providers/redis/redis.connection.js';
import { initializeRedisClient } from './providers/redis/redis.connection.js';
//import swaggerSpec from './swagger.json' with {type: 'json'};
dotenv.config();

const connectionString = appConfig.MONGODB_URI as string;
const PORT = appConfig.APP_PORT || 8008;

async function connectToMongoDB(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Database");
  } catch (error) {
    console.error("Error in connecting to MongoDB Database:", error);
  }
}

await connectToMongoDB(connectionString);

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
        url: 'http://localhost:8008/api/v1',
        description: 'Development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        basicAuth: {
        type: "http",
        scheme: "basic"
      }
      },
    },
    security: [
      {
        bearerAuth: [],
      }
    ]
  },
  apis: ['./dist/routes/user.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
//console.log(swaggerSpec)

const app = express();
app.use(express.json());
app.use(cors());
app.use(BodyParser.json());
await initializeRedisClient()
//await redisClient();
//app.use(errors()); // to handle error only coming from celebrate
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', userRouter);


app.get('/', (req, res) => {
  res.status(200).send("Hello World!");
});

app.use(celebrateErrors());

// Custom Error Handling Middleware for errors from celebrate
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.joi) {
    return res.status(400).json({
      status: 'fail',
      message: err.joi.message,
      details: err.joi.details,
    });
  }
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `)
})
