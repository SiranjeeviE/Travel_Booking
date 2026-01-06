
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing (allows React frontend to talk to this API)
app.use(cors());
// Built-in middleware to parse incoming JSON requests
app.use(express.json());

// Establish Connection to MongoDB
connectDB();

/**
 * Root/Health Check Route
 * Useful for verifying if the server is up and running.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Explore Ease API is operational',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Listening
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
