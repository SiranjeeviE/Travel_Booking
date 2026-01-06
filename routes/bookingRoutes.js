
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';

const router = express.Router();

// Apply protection to all booking endpoints
router.use(protect);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Fetch bookings for the logged-in user
 */
router.get('/my-bookings', getMyBookings);

/**
 * @route   POST /api/bookings
 * @desc    Create a new room booking
 */
router.post('/', createBooking);

export default router;
