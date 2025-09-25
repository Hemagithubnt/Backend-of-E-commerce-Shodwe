import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDb.js";
import userRouter from "./route/user.route.js";
const app = express();

// CORS first
app.use(cors());

// Body parsing middleware MUST come early
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware - TEMPORARY (remove after testing)
app.use((req, res, next) => {
  console.log('=== Debug Info ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('==================');
  next();
});

app.use(cookieParser());
app.use(morgan('combined'));

// Helmet last among middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.get("/", (request, response) => {
  response.json({
    message: "Server is running on port " + process.env.PORT,
  });
});

// Routes
app.use('/api/user', userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: true,
    success: false
  });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("server is running on port", process.env.PORT);
  });
});