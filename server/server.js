const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

//Load environment variables
dotenv.config();
//Connect to MongoDB
connectDB();

const app = express();

// --- MIDDLEWARE ---

//Improve security with HTTP headers
app.use(helmet());

//Enable CORS for web and mobile communication
app.use(cors());

//Body parsor for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('Habitree API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})



