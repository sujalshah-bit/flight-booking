const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { userSignupValidation } = require('../middleware/userVadilation');
const verifyToken = require('../db/auth_user');

router.post('/signup', userSignupValidation, async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Extract email and password from the request body
  const { email, password } = req.body;

  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    user = new User({ email, password: hashedPassword });

    // Save the user to the database
    await user.save();

    // Respond with a success message
    res.status(201).json({ message: 'User successfully registered' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token and send it as a response
    const token = jwt.sign({ email: user.email, isAdmin: false }, process.env.SECRET_USER_KEY);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/searchflights', verifyToken, async (req, res) => {
    const { date, time } = req.query;
  
    try {
      const flights = await Flight.find({ date, time });
      res.status(200).json({ flights });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/bookflight/:flightId', verifyToken, async (req, res) => {
    const { flightId } = req.params;
    const { seatNumber, passengerName } = req.body;
  
    try {
      // Validate if the flightId is a valid MongoDB ObjectId
      if (!mongoose.isValidObjectId(flightId)) {
        return res.status(400).json({ error: 'Invalid flightId' });
      }
  
      // Check if the flight exists in the database
      const flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
  
      // Check if there are available seats for booking
      if (flight.seatsAvailable <= 0) {
        return res.status(409).json({ error: 'No available seats for booking' });
      }
  
      // Create a new booking and save it to the database
      const booking = new Booking({
        flightNumber: flight.flightNumber,
        time: flight.time,
        seatNumber,
        passengerName,
        passengerEmail,
      });
      await booking.save();
  
      // Update the seatsAvailable count for the flight
      flight.seatsAvailable--;
  
      await flight.save();
  
      res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/mybookings', verifyToken, async (req, res) => {
    const { email } = req.user; 
  
    try {
      const bookings = await Booking.find({ passengerEmail: email });
      res.status(200).json({ bookings });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  


module.exports = router;
