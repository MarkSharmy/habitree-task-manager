const Session = require('../models/session');
const Task = require('../models/task');

// @desc    Start a work session
exports.startSession = async (req, res) => {
    try {
        const { taskId } = req.body;

        //Ensure the task exists
        const task = await Task.findById(taskId);
        if(!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const session = await Session.create({
            userId: req.user.id,
            taskId
        });

        res.status(201).json({ success: true, session });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Stop a work session and update task total time
exports.stopSession = async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            userId: req.user.id,
            isCompleted: false
        });

        if (!session) return res.status(404).json({ success: false, message: 'Active session not found' });

        session.endTime = Date.now();
        //Calculate duration in seconds
        session.duration = Math.floor((session.endTime - session.startTime) / 1000 );
        session.isCompleted = true;

        await session.save();

        //Update the Task's cumulative time
        await Task.findByIdAndUpdate(session.taskId, {
            $inc: { totalTimeSpent: session.duration }
        });

        res.status(200).json({ success: true, session });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}