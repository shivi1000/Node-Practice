import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as userRouter } from './routes/user.routes.js';
import * as dotenv from "dotenv";
import { appConfig } from './common/appConfig.js';
import { specs, swaggerUi } from './swagger-config.js';
dotenv.config();

const MongoDb_Connection_String = `mongodb://localhost:27017/NODE-PRACTICE`;
//const MongoDb_Connection_String = appConfig.DB_URI as string;
//console.log(">>>>>>>>",process.env.MONGODB_URI )
const PORT = appConfig.APP_PORT || 8008;

async function connectToMongoDB(uri: string) {
  await mongoose.connect(String(uri));
  console.log("Connected to MongoDB Database");
}
try {
  await connectToMongoDB(MongoDb_Connection_String)
} catch (error) {
  console.log("Error in connecting to Mongodb Database", error)
}

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs, { explorer: true }));
app.use('/api/v1', userRouter);

app.get('/', (req, res) => {
  res.status(200).send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `)
})
