const User = require('../models/user');

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { username, email } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { autoRollover } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { 'settings.autoRollover': autoRollover } },
            { new: true }
        ).select('-password');

        res.json({ success: true, settings: user.settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};