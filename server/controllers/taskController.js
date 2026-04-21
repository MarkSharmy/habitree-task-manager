const Task = require('../models/task');
const Group = require('../models/group');
const Project = require('../models/project');
const Session = require('../models/session');
const Roadmap = require('../models/roadmap');
const rolloverIncompleteItems = require('../utils/rolloverLogic');

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, groupId, category, subtasks } = req.body;

        const task = await Task.create({
            userId: req.user.id,
            title,
            description, 
            groupId,
            category,
            subtasks
        });

        res.status(201).json(task);

    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
    try {
        // Find the task by ID and ensure it belongs to the logged-in user
        // We populate 'groupId' to get the group name and color for the Details sidebar
        const task = await Task.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        }).populate('groupId', 'name color');

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: "Task not found" 
            });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
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
        await Roadmap.findOneAndUpdate(
            { "nodes.id": taskId }, 
            { $pull: { nodes: { id: taskId }, edges: { $or: [{ source: taskId }, { target: taskId }] } } }
        );

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

        if(task.projectId) {
            const project = await Project.findById(task.projectId);

            if (project) {
                // 1. Remove from all existing columns
                Object.keys(project.kanban).forEach(col => {
                    if (Array.isArray(project.kanban[col])) {
                        project.kanban[col] = project.kanban[col].filter(id => id.toString() !== task._id.toString());
                    }
                });
            
                // 2. Map Task status to Kanban column
                let targetColumn; 
                switch(status) {
                    case 'Completed': 
                        targetColumn = 'done'; 
                        break;
                    case 'On-Going':
                        targetColumn = 'doing';
                        break;
                    case 'Shelved':
                    case 'Not Started':
                        targetColumn = 'todo';
                        break;
                    default:
                        return res.status(400).json({ success: false, message: "Invalid Status" });
                }
            
                project.kanban[targetColumn].push(task._id);
                await project.save();
            }
        }

        res.json({ success: true, task });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


