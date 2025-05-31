import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.route';
import errorHandler from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Connect database
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler as express.ErrorRequestHandler);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log("Server is running now on the port", port);
});
