
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

/**
 * Creates a new booking for the authenticated user.
 */
export const createBooking = async (req, res) => {
  try {
    const { room: roomId, checkInDate, checkOutDate } = req.body;

    // 1. Validate dates
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (end <= start) {
      return res.status(400).json({
        status: 'fail',
        message: 'Check-out date must be after check-in date'
      });
    }

    // 2. Get room details for pricing
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'Room not found'
      });
    }

    // 3. Calculate total price
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    // 4. Create booking
    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'confirmed' // Simplified: auto-confirm for this version
    });

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Retrieves all bookings associated with the currently logged-in user.
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'room',
        populate: { path: 'hotel', select: 'name location' }
      });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
