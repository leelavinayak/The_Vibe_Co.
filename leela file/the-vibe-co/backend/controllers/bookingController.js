const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create a booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { event, tickets, specialRequests } = req.body;
    const eventDoc = await Event.findById(event);

    if (!eventDoc) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalAmount = eventDoc.price * tickets;

    const booking = await Booking.create({
      event,
      user: req.user._id,
      tickets,
      totalAmount,
      specialRequests,
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    // Add user to event attendees
    eventDoc.attendees.push(req.user._id);
    await eventDoc.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings };
