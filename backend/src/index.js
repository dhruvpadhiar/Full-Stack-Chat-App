import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();
app.use(express.json())

app.use('/api/auth', authRoutes);


app.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
  connectDB();
});