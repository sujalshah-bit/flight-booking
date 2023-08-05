const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  passengerEmail: {
    type: String,
    required: true,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
