const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
});

// --- MIDDLEWARE ---
app.use((req, res, next) => { req.io = io; next(); });
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- ROUTES ---
app.get('/', (req, res) => res.send('Habitree API is running...'));

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/tasks',         require('./routes/taskRoutes'));
app.use('/api/projects',      require('./routes/projectRoutes'));
app.use('/api/roadmaps',      require('./routes/roadmapRoutes'));
app.use('/api/groups',        require('./routes/groupRoutes'));
app.use('/api/sessions',      require('./routes/sessionRoutes'));
app.use('/api/planner',       require('./routes/plannerRoutes'));
app.use('/api/stats',         require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`User joined project room: ${projectId}`);
    });

    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`User joined private room: ${userId}`);
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});