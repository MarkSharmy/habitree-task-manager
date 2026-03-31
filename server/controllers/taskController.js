const Task = require('../models/task');
const Group = require('../models/group');
const Project = require('../models/project');
const Session = require('../models/session');
//const Roadmap = require('../models/roadmap');

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
}

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
}

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
}

// @desc    Delete a task and cleanup all references
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        // 1. Find the task first to get its ProjectID
        const task = await Task.findById(taskId);
        if(!task) return res.status(404).json({ success: false, message: "Task not found" });

        // 2. Remove Task ID from the Project's Kanban arrays
        const projectId = task.projectId;

        if (projectId) {
            await Project.findByIdAndUpdate(projectId, {
                $pull: {
                    "kanban.todo": taskId,
                    "kanban.doing": taskId,
                    "kanban.done": taskId,
                    "kanban.testing": taskId,
                    "kanban.blocked": taskId,
                    "kanban.onHold": taskId,
                    "kanban.trash": taskId,
                    "kanban.backendBacklog": taskId,
                    "kanban.frontendBacklog": taskId,
                    "kanban.mobileBacklog": taskId,
                }
            });

            //3. Notify collaborators via socket io
            req.io.to(projectId.toString()).emit('taskDeleted', { taskId });
        }

        // 4 Remove Task from any Roadamp Milestone
        await Roadmap.findOneAndUpdate({
            { taskId: taskId },
            { 
                $pull: {
                    nodes: { id: taskId },
                    edges: { $or: [{ source: taskId }, { target: taskId }]}
                }
            }
        });

        // 5. Delete the task itself
        await task.deleteOne();

        res.json({ 
            success: true,
            message: "Task and all associated sessions/references deleted successfully",
        });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const handleTaskRollover = async (userId) => {
    const user = await User.findById(userId);

    // If user turned off rollver, exit early
    if(!user.settings.autoRollover) return;

    const startOfToday = new Date();
    startOfToday.setHour(0, 0, 0, 0);

    const unfinishedTasks = await Task.find({
        userId,
        scheduledDate: { $lt: startOfToday, $ne: null },
        status: { $in: ['Not Started', 'On-Going'] }
    });

    if (unfinishedTasks.length > 0) {
        //Update all these tasks to be scheduled for today
        await Task.updateMany(
            { _id: { $in: unfinishedTasks.map(t => t._id )}},
            { $set: { scheduledDate: startOfToday } }
        );
        console.log(`Rolled over ${unfinishedTasks.length} tasks for user: ${userId}`);
    }
}

// @desc    Get all tasks scheduled for today
// @route   GET /api/tasks/planner/today
exports.getDailyPlanner = async (req, res) => {
    try {

        await handleTaskRollover(req.user.id);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            userId: req.user.id,
            scheduledDate: { $gte: startOfToday, $lte: endOfToday },
        }).sort({ scheduledDate: -1 });

        res.json({
            success: true,
            rolloverActive: req.user.settings.autoRollover,
            count: tasks.length,
            tasks
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get tasks fro a specific date (Daily Planner)
// @route   GET /api/tasks/planner/:date
exports.getTasksByDay = async (req, res) => {

    try {
        const baseDate = new Date(req.params.date);

        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(baseDate);
        end.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            userId: req.user.id,
            scheduledDate: { $gte: start, $lte: end },
        });

        res.json({ success: true, tasks });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Schedule a task for a specific date 
// @route   PUT /api/tasks/:id/schedule
exports.scheduleTask = async (req, res) => {
    try {
        const { dateString } = req.body; // expecting ISO date string
        const date = new Date(dateString);
        if(isNaN(date.getTime())) return res.status(400).json({ success: false, message: "Incorrect date format" });

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { scheduledDate: new Date(date) },
            { new: true }
        );

        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        res.json({ success: true, task });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Update task status and sync with Kanban
exports.updateTaskStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status },
            { new: true }
        );

        if(!task) return res.status(404).json({ success: false, message: "Task not found" });

        // CRITICAL: Sync with Project Kanban
        const project = await Project.findById(task.projectId);
        
        if(task.projectId) {
            const project = await Project.findById(task.projectId);

            if (project) {
                // 1. Remove from all existing columns
                Object.keys(project.kanban).forEach(col => {
                    // Ensure we only filter if the property is an array
                    if (Array.isArray(project.kanban[col])) {
                        project.kanban[col] = project.kanban[col].filter(id => id.toString() !== task._id.toString());
                    }
                });
            
                // 2. Map Task status to Kanban column
                let targetColumn; 
            
                switch(status) {
                    case 'Completed': // No colon after 'case'
                        targetColumn = 'done';
                        break;
                    case 'On-Going':
                        targetColumn = 'doing';
                        break;
                    case 'Shelved':
                    case 'Not Started': // Added this to handle your model default
                        targetColumn = 'todo';
                        break;
                    default:
                        // Use a return here to stop execution if the status is invalid
                        return res.status(400).json({ success: false, message: "Status incorrectly formatted" });
                }
            
                // 3. Push to the new column and save
                project.kanban[targetColumn].push(task._id);
                await project.save();
            }
        }

        res.json({ success: true, task });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


