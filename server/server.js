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
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
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

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

// Analytics & Alerts
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- Socket.io Connection logic ---
io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    //Join a Project room for Kanban sync
    socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`User joined project room: ${projectId}`);
    });

    //Join a PrivateUser room for personal notifications
    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`User joined private room: ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// --- ERROR HANDLING ---

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- START SERVER ---

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})



