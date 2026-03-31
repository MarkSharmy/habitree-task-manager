const Session = require('../models/session');
const Task = require('../models/task');
const mongoose = require('mongoose');

// @desc    Get Today's Productivity Overview (8-hour goal)
// @route   GET /api/stats/today
exports.getTodayOverview = async (req, res) => {
    try {
        const startofToday = new Date();
        startofToday.setHours(0, 0, 0, 0);

        //Fetch all completed sessions for today
        const sessions = await Session.find({
            userId: req.user.id,
            startTime: { $gte: startofToday },
            status: 'Completed'
        });

        const totalMinutesToday = sessions.reduce((acc, sess) => acc + (sess.durationMinutes || 0), 0);
        const totalHoursToday = parseFloat((totalMinutesToday /60).toFixed(2));

        const EIGHT_HOURS_IN_MINUTES = 8 * 60;

        // Calculate Efficiency score (Productive Hours / 8)
        const dailyEfficiencyScore = Math.round( (totalMinutesToday / EIGHT_HOURS_IN_MINUTES) * 100 );

        res.json({
            success: true,
            date: startofToday.toISOString().split('T')[0],
            metrics: {
                totalMinutes: totalMinutesToday,
                totalHours: totalHoursToday,
                efficiencyScore: `${dailyEfficiencyScore}`,
            },
            sessionsCount: sessions.length
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get Weekly Productivity (Last 7 days aggregation)
// @route   GET /api/stats/weekly
exports.getWeeklyStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const stats = await Session.aggregate([
            {
                $match : {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    startTime: { $gte: sevenDaysAgo },
                    status: "Completed"
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: "$startTime" } },
                    totalMinutes: { $sum: '$durationMinutes' },
                    sessionCount: { $sum: 1}
                }
            },
            {
                $project: {
                    _id: 1,
                    totalMinutes: 1,
                    sessionCount: 1,
                    totalHours: { $divide: ['$totalMinutes', 60]}
                }
            },
            { $sort: { _id: 1} }
        ]);

        res.json({ success: true, stats });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get Monthly Heatmap Data (Productivity trends for current month)
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
                    status: "Completed"
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" }},
                    totalMinutes: { $sum: "$durationMinutes" },
                    sessionCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalMinutes: 1,
                    sessionCount: 1,
                    efficiency: { 
                        $multiply: [
                            { $divide: ["$totalMinutes", 480] }, // 480 mins = 8 hours
                            100
                        ] 
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, monthlyData });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get Task Stats (How many tasks completed vs total created)
// @route   GET /api/stats/tasks
exports.getTaskVolumeStats = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments({ userId: req.user.id });
        const completedTasks = await Task.countDocuments({
            userId: req.user.id,
            status: 'Completed'
        });

        res.json({
            success: true,
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0 
                ? `${((completedTasks / totalTasks) * 100).toFixed(1)}%`,
                : "0%"
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}