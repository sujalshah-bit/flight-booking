const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminSignupValidation } = require('../middleware/adminVadilation');
const Admin = require('../models/admin');
const Flight = require('../models/flight');
const verifyToken = require('../db/auth_admin');

router.post('/signup', adminSignupValidation, async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Extract email and password from the request body
  const { email, password } = req.body;

  try {
    // Check if the admin already exists in the database
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin with the hashed password
    admin = new Admin({ email, password: hashedPassword });

    // Save the admin to the database
    await admin.save();

    // Respond with a success message
    res.status(201).json({ message: 'Admin successfully registered' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  try {
    // Check if the admin exists in the database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token and send it as a response
    const token = jwt.sign({ email: admin.email, isAdmin: true }, process.env.SECRET_ADMIN_KEY);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add Flights
router.post('/addflight', verifyToken, async (req, res) => {
    const { flightNumber, time, destination } = req.body;
    // If seatsAvailable is not provided in the request body, it will default to 60 due to the model definition
    
    try {
      // Check if the flight already exists in the database based on the flightNumber
      const existingFlight = await Flight.findOne({ flightNumber });
      if (existingFlight) {
        return res.status(409).json({ error: 'Flight with the same flight number already exists' });
      }
  
      // Create a new flight instance with the provided details
      const flight = new Flight({ flightNumber, time, destination });
  
      // Save the flight to the database
      await flight.save();
  
      res.status(201).json({ message: 'Flight added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  // Remove Flights
router.delete('/removeflight/:flightId', verifyToken, async (req, res) => {
    const { flightId } = req.params;
  
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
  
      // Remove the flight from the database
      await flight.remove();
  
      // Also, remove any bookings associated with this flight
      await Booking.deleteMany({ flightNumber: flight.flightNumber });
  
      res.status(200).json({ message: 'Flight removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// View all bookings based on flight number and time
router.get('/bookings', verifyToken, async (req, res) => {
    // Validate the query parameters flightNumber and time before proceeding
    const { flightNumber, time } = req.query;
    if (!flightNumber || !time) {
      return res.status(400).json({ error: 'Flight number and time are required query parameters' });
    }
  
    try {
      // Check if the flight exists in the database
      const flight = await Flight.findOne({ flightNumber, time });
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
  
      // Get all bookings for the specified flight number and time
      const bookings = await Booking.find({ flightNumber, time });
  
      res.status(200).json({ bookings });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


module.exports = router;
