const Session = require('../models/session');
const Task = require('../models/task');
const mongoose = require('mongoose');


// @desc    Get Daily Efficiency and Overview (Actual work vs 8-hour goal)
exports.getTodayOverview = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const sessions = await Session.find({
            userId: req.user.id,
            startTime: { $gte: startOfToday },
            isCompleted: true
        }).populate('taskId', 'name');

        const totalSecondsToday = sessions.reduce((acc, sess) => acc + (sess.duration || 0), 0);

        const EIGHT_HOURS_IN_SECONDS = 8 * 3600;

        // Calculate Efficiency Score
        const dailyEfficiencyScore = Math.min(
            Math.round((totalSecondsToday / EIGHT_HOURS_IN_SECONDS) * 100),
            100 
        );

        res.json({
            success: true,
            date: startOfToday.toISOString().split('T')[0],
            metrics: {
                totalSeconds: totalSecondsToday,
                totalHours: parseFloat((totalSecondsToday / 3600).toFixed(2)),
                efficiencyScore: `${dailyEfficiencyScore}%`,
                goalSeconds: EIGHT_HOURS_IN_SECONDS
            },
            sessionsToday: sessions 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get Weekly Productivity (Time spent per day over the last 7 days)
exports.getWeeklyStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start from the beginning of that day

        const stats = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    startTime: { $gte: sevenDaysAgo }, // Fixed typo: startTIme -> startTime
                    isCompleted: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    totalSeconds: { $sum: "$duration" }, // Fixed: Added $ prefix
                    sessionCount: { $sum: 1 }
                }   
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({ success: true, stats });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getMonthlyStats = async (req, res) => {
    try{
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyData = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    startTime: { $gte: startOfMonth },
                    isCompleted: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%y-%m-%d", date: "$startTime" }},
                    totalSeconds: { $sum: "duration" },
                    uniqueTasks: { $addToSet: "$taskId" }
                }
            },
            { $sort: { day: 1 } }
        ]);

        res.json({ success: true, monthlyData });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}