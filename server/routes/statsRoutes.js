const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTodayOverview,
    getWeeklyStats,
    getMonthlyStats,
    getTaskVolumeStats,
} = require('../controllers/statsController');

router.use(protect);

// @route   GET /api/stats/today
router.get('/today', getTodayOverview);

// @route   GET /api/stats/weekly
router.get('/weekly', getWeeklyStats);

// @route   GET /api/stats/monthly
router.get('/monthly', getMonthlyStats);

// @route   GET /api/stats/tasks
router.get('/tasks', getTaskVolumeStats);

module.exports = router;