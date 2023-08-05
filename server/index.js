const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({path:'./.env'});

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database
require('./db/conn');

// Routes
app.get('/', () => console.log(`API's`))

app.use('/api/user', require('./router/user'));
app.use('/api/admin', require('./router/admin'));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
