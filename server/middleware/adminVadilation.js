const { body } = require('express-validator');

const adminSignupValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];



module.exports = { adminSignupValidation };

