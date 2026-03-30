const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkPrerequisites } = require('../middleware/dependencyMiddleware');

const {
    createTask,
    getGroupedTasks,
    updateTask,
    deleteTask,
    getDailyPlanner,
    getTasksByDay,
    scheduleTask,
    updateTaskStatus,
} = require('../controllers/taskControllers');

// All task routes require a logged-in user
router.use(protect);

// --- Core Task Management ---

// @route   POST /api/tasks (Create)
// @route   GET /api/tasks (Get all grouped by User Groups)
router.route('/')
    .post(createTask)
    .get(getGroupedTasks);

// @route   PUT /api/tasks/:id (General Update)
// @route   DELETE /api/tasks/:id (Cleanup delete)
router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

// --- Daily Planner & Scheduler ---

// @route   GET /api/tasks/planner/today (Fetch today + Trigger Rollover)
router.get('/planner/today', getDailyPlanner);

// @route   GET /api/tasks/planner/:date (Fetch for a specific calendar date)
router.put('/planner/:date', getTasksByDay);

// @route   PUT /api/tasks/:id/schedule (Pin to a date)
router.put('/:id/schedule', scheduleTask);

// @route   PUT /api/tasks/:id/status (Update status + Sync with Kanban)
router.put('/:id/status', checkPrerequisites, updateTaskStatus);

module.exports = router;