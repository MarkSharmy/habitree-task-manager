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

// @desc    Remove an entry from the planner tasks array
// @route   DELETE /api/planner/:date/:id
exports.deletePlannerTask = async (req, res) => {
    try {
        // Change 'entryId' to 'id' to match the route parameter /:date/:id
        const { date, id } = req.params; 
        const userId = req.user.id;

        const planner = await Planner.findOneAndUpdate(
            { userId, date },
            { 
                $pull: { tasks: { _id: id } } // Use 'id' here
            },
            { new: true } 
        ).populate({
            path: 'tasks.taskId',
            populate: { path: 'groupId', select: 'name color' }
        });

        if (!planner) {
            return res.status(404).json({ 
                success: false, 
                message: "Planner not found for this date" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Item removed from planner",
            planner 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
// @desc    Update a planner entry's time (and optionally comments)
// @route   PATCH /api/planner/:date/:id
exports.updatePlannerEntry = async (req, res) => {
    try {
        const { date, id } = req.params;
        const { time, comments } = req.body;
        const userId = req.user.id;

        const planner = await Planner.findOneAndUpdate(
            { userId, date, 'tasks._id': id },
            {
                $set: {
                    ...(time     !== undefined && { 'tasks.$.time': time }),
                    ...(comments !== undefined && { 'tasks.$.comments': comments }),
                },
            },
            { new: true }
        ).populate({
            path: 'tasks.taskId',
            populate: { path: 'groupId', select: 'name color' },
        });

        if (!planner) {
            return res.status(404).json({ success: false, message: 'Planner entry not found' });
        }

        res.json({ success: true, planner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};