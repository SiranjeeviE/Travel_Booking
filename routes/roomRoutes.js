
import express from 'express';
import { createRoom, getAllRooms } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected administrative routes
router.post('/', protect, createRoom);
router.get('/', getAllRooms);

export default router;
