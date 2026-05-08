const Session = require('../models/session');
const Task = require('../models/task');
const mongoose = require('mongoose');

// @desc    Get a specific day's productivity overview (defaults to today)
// @route   GET /api/stats/day?date=YYYY-MM-DD
exports.getDayOverview = async (req, res) => {
    try {
        let startOfDay, endOfDay;

        if (req.query.date) {
            startOfDay = new Date(req.query.date + 'T00:00:00.000Z');
            endOfDay   = new Date(req.query.date + 'T23:59:59.999Z');
        } else {
            startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
        }

        const sessions = await Session.find({
            userId: req.user.id,
            startTime: { $gte: startOfDay, $lte: endOfDay },
            status: 'Completed',
        });

        const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const efficiencyScore = Math.round((totalMinutes / 480) * 100) / 100;

        res.json({
            success: true,
            date: startOfDay.toISOString().split('T')[0],
            totalMinutes,
            efficiencyScore,
            sessionsCount: sessions.length,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Alias so nothing breaks if getTodayOverview is referenced elsewhere
exports.getTodayOverview = exports.getDayOverview;

// @desc    Get Weekly Productivity (Last 7 days aggregation)
// @route   GET /api/stats/weekly
exports.getWeeklyStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const stats = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    startTime: { $gte: sevenDaysAgo },
                    status: 'Completed',
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    totalMinutes: { $sum: '$durationMinutes' },
                    sessionCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 1, totalMinutes: 1, sessionCount: 1,
                    totalHours: { $divide: ['$totalMinutes', 60] },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, stats });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Monthly Heatmap Data
// @route   GET /api/stats/monthly
exports.getMonthlyStats = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyData = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    startTime: { $gte: startOfMonth },
                    status: 'Completed',
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    totalMinutes: { $sum: '$durationMinutes' },
                    sessionCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 1, totalMinutes: 1, sessionCount: 1,
                    efficiency: { $multiply: [{ $divide: ['$totalMinutes', 480] }, 100] },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, monthlyData });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Task Stats
// @route   GET /api/stats/tasks
exports.getTaskVolumeStats = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments({ userId: req.user.id });
        const completedTasks = await Task.countDocuments({ userId: req.user.id, status: 'Completed' });

        res.json({
            success: true,
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0
                ? `${((completedTasks / totalTasks) * 100).toFixed(1)}%`
                : '0%',
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};