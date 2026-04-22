const Planner = require('../models/planner');

exports.getPlannerByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        let planner = await Planner.findOne({ userId, date })
            .populate({
                path: 'tasks.taskId',
                populate: { path: 'groupId', select: 'name color' }
            });

        if (!planner) {
            planner = await Planner.create({ userId, date, tasks: [] });
        }

        res.status(200).json(planner);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// controllers/plannerController.js

exports.addTaskToPlanner = async (req, res) => {
    try {
        const { date } = req.params;
        const { taskId, subtaskId, time, comments } = req.body;
        const userId = req.user.id;

        // Validation: Don't allow null taskId
        if (!taskId) {
            return res.status(400).json({ success: false, message: "taskId is required" });
        }

        let planner = await Planner.findOne({ userId, date });
        if (!planner) {
            planner = new Planner({ userId, date, tasks: [] });
        }

        // Check if this specific combo is already there
        const alreadyScheduled = planner.tasks.find(t => 
            t.taskId?.toString() === taskId && t.subtaskId === subtaskId
        );

        if (!alreadyScheduled) {
            planner.tasks.push({ taskId, subtaskId, time, comments });
            await planner.save();
        }

        const updatedPlanner = await Planner.findById(planner._id).populate({
            path: 'tasks.taskId',
            populate: { path: 'groupId', select: 'name color' }
        });

        res.status(201).json(updatedPlanner);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};