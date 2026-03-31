const Session = require('../models/session');
const Task = require('../models/task');

// @desc    Start a work session
exports.startSession = async (req, res) => {
    try {
        const session = await Session.create({
            userId: req.user.id,
            startTime: new Date(),
            status: 'In Progress'
        });
        
        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Stop a work session and update task total time
exports.stopSession = async (req, res) => {
    try {
        const { durationMinutes } = req.body; // calculated by frontend timer
        const session = await Session.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                endTime: new Date(),
                durationMinutes,
                status: 'Completed'
            },
            { new: true }
        );

        res.json({ success: true, session });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Sync offline sessions from mobile
// @route   POST /api/sessions/sync
exports.syncMobileSessions = async (req, res) => {
    try {
        const { actionQueue } = req.body; // Array of session objects
        const results = { synced: [], conflicts: [], skipped: 0 };

        for (const mobileSess of actionQueue) {
            // 1. Idempotency Check: Skip if already synced
            const existing = await Session.findOne({ mobileSyncId: mobileSess.mobileId });
            if (existing) {
                results.skipped++;
                continue;
            }

            // 2. Conflict Check: Check for overlapping time blocks on the same date
            const overlap = await Session.findOne({
                userId: req.user.id,
                startTime: { $lt: new Date(mobileSess.endTime) },
                endTime: { $gt: new Date(mobileSess.startTime) }
            });

            if (overlap) {
                // Mark as conflict for the user to resolve in the UI
                results.conflicts.push({ ...mobileSess, reason: "Time Overlap"});
                continue;
            }

            // 3, Valid Session: Create the record
            const newSession = await Session.create({
                userId: req.user.id,
                startTime: mobileSess.startTime,
                endTime: mobileSess.endTime,
                durationMinutes: mobileSess.durationMinutes,
                status: "Completed",
                mobileSyncId: mobileSess.mobileId
            });

            results.synced.push(newSession._id);
        }

        // 4. Real-tile Notification: Alert the web version of refresh stats
        if (results.synced.length > 0) {
            req.io.to(req.user.id).emit('statsUpdated', {
                message: "Mobile sessions synced successfully"
            });
        }

        res.json({
            success: true,
            message: "Sync processing complete",
            results
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @route   POST /api/sessions/resolve-conflict
exports.resolveConflict = async (req, res) => {
    try {
        const { action, mobileSession, existingSessionId } = req.body;

        if (action === 'OVERWRITE') {
            await Session.findByIdAndDelete(exisitingSessionId);
            const newSess = await Session.create({
                ...mobileSession,
                userId: req.user.id,
            });
            return res.json({ success: true, session: newSession });
        }

        if (action === 'DISCARD') {
            return res.json({ success: true, message: "Conflict discarded" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}