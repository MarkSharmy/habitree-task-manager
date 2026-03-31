const Task = require('../models/task');

// @desc    Add a subtask to a task
// @route   POST /api/tasks/:taskId/subtasks
exports.createSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if(!task) return res.status(404).json({ success: false, message: "Task not found" });

        const newSubtask = {
            title: req.body.title,
            scheduledDate: req.body.scheduledDate || null,
            status: 'Not Started'
        };

        tasks.subtasks.push(newSubtask);
        await task.save(); //Triggers the Roadmap sync Middleware

        res.status(201).json({ success: true, subtasks: task.subtasks });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Update a specific subtask (including scheduling)
// @route   PATCH /api/tasks/:taskId/subtasks/:subTaskId
exports.updateSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;
        const updates = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: taskId, "subtasks._id": subtaskId },
            {
                $set: {
                    "subtasks.$.title": updates.title,
                    "subtasks.$.isCompleted": updates.isCompleted,
                    "subtasks.$.status": updates.status,
                    "subtasks.$.scheduledDate": updates.scheduledDate
                }
            },
            { new: true }
        );

        if (updates.status === 'Completed') {
            await Task.updateOne(
                { _idL taskId, "subtasks.id": subtaskId },
                { $set: { "subtasks.$.isCompleted": true } }
            );
        }

        await task.save(); //recalculate parent task progress
        res.json({ success: true, task });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Delete a subtask
// @route   DELETE /api/tasks/:taskId/subtasks/:subTaskId
exports.deleteSubtask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $pull: { subtasks: { _id: req.params.subtaskId } } },
            { new: true }
        );

        await task.save();
        res.json({ success: true, message: "Subtask removed successfully" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}