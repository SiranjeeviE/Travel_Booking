
import express from 'express';
import { createHotel, getAllHotels, getHotel } from '../controllers/hotelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly viewable routes
router.get('/', getAllHotels);
router.get('/:id', getHotel);

// Protected administrative routes
router.post('/', protect, createHotel);

export default router;
