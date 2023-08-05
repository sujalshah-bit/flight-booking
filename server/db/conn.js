// db.js
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

module.exports = db;