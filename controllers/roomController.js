
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

/**
 * Adds a new room to a specific hotel.
 */
export const createRoom = async (req, res) => {
  try {
    // Ensure the hotel exists before creating a room
    const hotel = await Hotel.findById(req.body.hotel);
    if (!hotel) {
      return res.status(404).json({ status: 'fail', message: 'Hotel not found' });
    }

    const newRoom = await Room.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { room: newRoom }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Lists all rooms (optional utility).
 */
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('hotel', 'name');
    res.status(200).json({
      status: 'success',
      data: { rooms }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
