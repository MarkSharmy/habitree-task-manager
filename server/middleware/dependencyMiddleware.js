const isTaskLocked = require('../utils/checkDependency');

/**
 * Middleware to prevent starting/moving tasks that have unfinished prerequisites.
 */
exports.checkPrerequisites = async (req, res, next) => {
    try {
        //Support getting taskId from params and from the body
        const taskId = req.params.id || req.body.taskId;

        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required for dependency check."
            });
        }

        //Check if the task is locked in the roadmap
        const locked = await isTaskLocked(taskId);

        if (locked) {
            return res.status(403).json({
                success: false,
                message: "Dependency Error: You must complete the prerequite nodes in the Skill Roadmap before starting this task"
            });
        }

        //If not locked, proceed to the controller
        next();

    }catch(error) {
        res.status(500).json({success: false, message: error.message });
    }
}