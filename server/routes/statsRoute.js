const express = require('express');
const router = express.Router();

const {
    getTodayOverview,
    getDailyEffort,
    getWeeklyStats,
    getMonthlyStats,
    getTaskEfficiency,
} = require('../controllers/statsController');

// All stats are private to the logged-in user
router.use(protect);

// @route   GET /api/stats/today
// Overview of today's work vs. the 8-hour goal
router.get('/today', getTodayOverview);

// @route   GET /api/stats/daily
// Last 7 days of effort (Time spent per day)
router.get('/daily', getDailyEffort);

// @route   GET /api/stats/weekly
// Weekly breakdown (Task volume vs. Total time)
router.get('/weekly', getWeeklyStats);

// @route   GET /api/stats/monthly
// Monthly trend analysis
router.get('/monthly', getMonthlyStats);

// @route   GET /api/stats/task/:taskId
// Specific efficiency for a single task
router.get('/task/:taskId', getTaskEfficiency);


module.exports = router;