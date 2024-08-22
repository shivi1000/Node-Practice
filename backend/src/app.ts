import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as userRouter } from './routes/user.routes.js';
import * as dotenv from "dotenv";
dotenv.config();

const MongoDb_Connection_String = `mongodb://localhost:27017/NODE-PRACTICE`;
//const MongoDb_Connection_String = process.env.MONGODB_URI as string;
const PORT = process.env.PORT || 8008;
//console.log(">>>>>>>>",process.env.MONGODB_URI )

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
app.use('/api/v1', userRouter);

app.get('/', (req, res) => {
  res.status(200).send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `)
})
