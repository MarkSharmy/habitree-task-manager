const Task = require('../models/task');
const Group = require('../models/group');

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, groupId, category, scheduledDate, subtasks } = req.body;

        const task = await Task.create({
            userId: req.user.id,
            title,
            description, 
            groupId,
            category,
            scheduledDate,
            subtasks
        });

        res.status(201).json(task);

    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tasks grouped by their user-defined Groups
// @route   GET /api/tasks
exports.getGroupedTasks = async (req, res) => {
    
    //fetch all the groups for the user
    const groups = await Group.find({ userId: req.user.id });

    //fetch all tasks for this user
    const tasks = await Task.find({ userId: req.user.id }).populate('groupId');

    //Organize tasks into a map where key is Group name
    const organized = { "Uncategorized": [] };
    groups.forEach(g => organized[g.name] = []);

    tasks.forEach(task => {
        const groupName = task.groupId ? task.groupId.name : "Uncategorized";
        if (!organized[groupName]) organized[groupName] = [];
        organized[groupName].push(task);
    });

    res.json(organized);
};

// @desc    Get tasks fro a specific date (Daily Planner)
// @route   GET /api/tasks/planner/:date
exports.getTasksByDay = async (req, res) => {

    try {
        const date = new Date(req.params.date);
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));

        const tasks = await Task.find({
            userId: req.user.id,
            scheduledDate: { $gte: start, $lte: end },
        });

        res.json(tasks);

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task (Status, Subtasks, Time Tracking)
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        res.json(task);

    }catch( error) {
        res.status(500).json({ success: false, message: error.message});
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

        if(!task) return res.status(404).json({ success: false, message: "Task not found" });

        await task.deleteOne();
        res.json({ success: true, message: "Task deleted" });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
