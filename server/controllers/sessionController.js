const Session = require('../models/session');
const Task = require('../models/task');

// @desc    Start a work session
exports.startSession = async (req, res) => {
    try {
        const session = await Session.create({
            userId: req.user.id,
            startTime: new Date(),
            status: 'In Progress'
        });
        
        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Stop a work session and update task total time
exports.stopSession = async (req, res) => {
    try {
        const { durationMinutes } = req.body; // calculated by frontend timer
        const session = await Session.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                endTime: new Date(),
                durationMinutes,
                status: 'Completed'
            },
            { new: true }
        );

        res.json({ success: true, session });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}