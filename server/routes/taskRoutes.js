const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const subtaskController = require('../controllers/subtaskController');
const { protect } = require('../middleware/authMiddleware');
const { checkPrerequisites } = require('../middleware/dependencyMiddleware');

// All task routes require authentication
router.use(protect);

/**
 * @section Task Core CRUD
 */
router.route('/')
    .get(taskController.getGroupedTasks) // Get tasks organized by User Groups
    .post(taskController.createTask);    // Create a new task

router.route('/:id')
    .put(taskController.updateTask)      // General update (title, description, etc.)
    .delete(taskController.deleteTask);  // Cleanup task and all roadmap/project refs

/**
 * @section Daily Planner & Scheduling
 */
// Unified planner for "Today" (Triggers Rollover Logic)
router.get('/planner/today', taskController.getDailyPlanner);

// Get items for a specific date (Historical or Future)
router.get('/planner/date', taskController.getTasksByDay);

// Assign a task to a specific date
router.put('/:id/schedule', taskController.scheduleTask);

/**
 * @section Task Execution & Status
 */
// Update status (Start/Complete/Shelve) + Kanban Bridge + Dependency Check
router.patch('/:id/status', checkPrerequisites, taskController.updateTaskStatus);

/**
 * @section Subtask Management
 */
// Add a subtask to a parent task
router.post('/:taskId/subtasks', subtaskController.addSubTask);

// Update a specific subtask (Schedule it, Rename it, or Complete it)
router.patch('/:taskId/subtasks/:subTaskId', subtaskController.updateSubTask);

// Remove a subtask
router.delete('/:taskId/subtasks/:subTaskId', subtaskController.deleteSubTask);

module.exports = router;