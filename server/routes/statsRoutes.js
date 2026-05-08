const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getDayOverview,
    getWeeklyStats,
    getMonthlyStats,
    getTaskVolumeStats,
} = require('../controllers/statsController');

router.use(protect);

// @route   GET /api/stats/day?date=YYYY-MM-DD  (date optional, defaults to today)
router.get('/day', getDayOverview);

// Keep /today as alias for backwards compatibility
router.get('/today', getDayOverview);

// @route   GET /api/stats/weekly
router.get('/weekly', getWeeklyStats);

// @route   GET /api/stats/monthly
router.get('/monthly', getMonthlyStats);

// @route   GET /api/stats/tasks
router.get('/tasks', getTaskVolumeStats);

module.exports = router;