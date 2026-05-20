const express = require('express');
const router = express.Router();
const { getPlannerByDate, addTaskToPlanner, deletePlannerTask, updatePlannerEntry } = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:date', getPlannerByDate);
router.post('/:date/add', addTaskToPlanner);
router.patch('/:date/:id', updatePlannerEntry);
router.delete('/:date/:id', deletePlannerTask);

module.exports = router;