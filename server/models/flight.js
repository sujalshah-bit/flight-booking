const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
  },
  time: {
    type: Date,
    required: true,
  },
  seatsAvailable: {
    type: Number,
    default: 60,
  },
  destination: {
    type: String,
    required: true,
  },
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
