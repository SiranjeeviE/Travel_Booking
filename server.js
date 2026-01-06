
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Establish Connection to MongoDB
connectDB();

/**
 * Routes
 */
// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (middleware is handled inside the router)
app.use('/api/bookings', bookingRoutes);

// Root/Health Check Route
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
