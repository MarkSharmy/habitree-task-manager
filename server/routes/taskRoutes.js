const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTask, getGroupedTasks, getTasksByDay, updateTask, deleteTask } = require('../controllers/taskController');

//Task Routes
router.use(protect);
router.route('/').get(getGroupedTasks).post(createTask);
router.route('/planner/:date').get(getTasksByDay);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;