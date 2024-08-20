import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
//import { router as studentRouter } from './mongodb/routes/student.routes.js';
import { router as userRouter } from './mongodb/routes/userOnboarding.routes.js';

const MongoDb_Connection_String = `mongodb://localhost:27017/NODE-PRACTICE`;

async function connectToMongoDB(connectionString: string) {
  await mongoose.connect(connectionString);
  console.log("Connected to MongoDB Database");
}
try {
  await connectToMongoDB(MongoDb_Connection_String)
} catch (error) {
  console.log("Error in connecting to Mongodb Database", error)
}

const PORT = 8008;

const app = express();
app.use(express.json());
app.use(cors());
//app.use('/api', studentRouter);
app.use('/api/v1', userRouter);

app.get('/', (req, res) => {
  res.status(200).send("Hello World! from Shivani");
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} `)
})
