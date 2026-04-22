const Planner = require('../models/planner');
const Task = require('../models/task');

// @desc    Get planner for a specific date (creates if doesn't exist)
// @route   GET /api/planner/:date
exports.getPlannerByDate = async (req, res) => {
    try {

        const { date } = req.params;
        const userId = req.user.id;

        let planner = await Planner.findOne({ userId, date })
            .populate({
                path: 'tasks',
                populate: { path: 'groupId', select: 'name color'}
            });

        if (!planner) {
            planner = await Planner.create({
                userId,
                date,
                tasks: []
            })
        }

        res.status(200).json(planner);

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Add a task to a specific date's planner
// @route   POST /api/planner/:date/add
exports.addTaskToPlanner = async (req, res) => {
    try {
        const { date } = req.params;
        const { taskId } = req.body;

        const planner = await Planner.findOneAndUpdate(
            { userId: req.user.id, date },
            { $addToSet: { tasks: taskId } },
            { new: true, upsert: true } 
        ).populate('tasks');

        res.json(planner);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};