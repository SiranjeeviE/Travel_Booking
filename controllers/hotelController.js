
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

/**
 * Creates a new hotel property.
 */
export const createHotel = async (req, res) => {
  try {
    const newHotel = await Hotel.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { hotel: newHotel }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Fetches all available hotels.
 */
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: { hotels }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Fetches a single hotel and its associated rooms.
 */
export const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const rooms = await Room.find({ hotel: req.params.id });

    if (!hotel) {
      return res.status(404).json({ status: 'fail', message: 'No hotel found with that ID' });
    }

    res.status(200).json({
      status: 'success',
      data: { hotel, rooms }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
