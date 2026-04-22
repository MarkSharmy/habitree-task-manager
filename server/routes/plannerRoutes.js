const express = require('express');
const router = express.Router();
const { getPlannerByDate, addTaskToPlanner } = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:date', getPlannerByDate);
router.post('/:date/add', addTaskToPlanner);

module.exports = router;