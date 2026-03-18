const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);

//Initialize Socket.io
const io = new Server({
    cors: {
        origin: "*", // In production, replace with frontend URL
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// --- MIDDLEWARE ---

app.use((req, res, next) => {
    req.io = io;
    next();
});

//Improve security with HTTP headers
app.use(helmet());

//Enable CORS for web and mobile communication
// app.use(cors());

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

// --- API ROUTES ---
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// --- Socket.io Connection logic ---
io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    //Users should join a room based on the Project ID
    socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`User joined project: ${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
    })
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})



