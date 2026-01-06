
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

router.get('/my-bookings', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Fetched bookings for user: ${req.user.name}`
    // Real logic would query Booking model here
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Booking request received',
    user: req.user._id
  });
});

export default router;
