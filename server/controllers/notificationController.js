const Notification = require('../models/notification');

// @desc    Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
    try{
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username');

        res.json({ success: true, notifications });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Mark a notification as read
exports.readNotification = async (req, res) => {
    try {
        await Notication.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: "Notication marked as read" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}