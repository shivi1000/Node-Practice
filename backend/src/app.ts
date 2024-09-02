import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as userRouter } from './routes/user.routes.js';
import * as dotenv from "dotenv";
import { appConfig } from './common/appConfig.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', userRouter);


app.get('/', (req, res) => {
  res.status(200).send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `)
})
