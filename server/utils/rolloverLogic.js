const Task = require('../models/task');

/**
 * Moves uncompleted tasks and subtasks from the past to the current date.
 * @param {String} userId - The ID of the logged-in user.
 */
const rolloverIncompleteItems = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Rollover Top-Level Tasks
    // Find tasks scheduled before today that are NOT 'Completed'
    await Task.updateMany(
        {
            userId,
            scheduledDate: { $lt: today, $ne: null },
            status: { $ne: 'Completed' }
        },
        { $set: { scheduledDate: today } }
    );

    // 2. Rollover Subtasks
    // This requires a more granular approach since subtasks are in an array
    const tasksWithExpiredSubtasks = await Task.find({
        userId,
        "subtasks.scheduledDate": { $lt: today, $ne: null },
        "subtasks.status": { $ne: 'Completed' }
    });

    for (const task of tasksWithExpiredSubtasks) {
        let modified = false;
        task.subtasks.forEach(sub => {
            if (sub.scheduledDate && sub.scheduledDate < today && sub.status !== 'Completed') {
                sub.scheduledDate = today;
                modified = true;
            }
        });

        if (modified) {
            await task.save(); // Triggers existing roadmap sync middleware
        }
    }

    return { success: true };
};

module.exports = rolloverIncompleteItems;