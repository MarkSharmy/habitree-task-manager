const User = require('../models/user');



exports.updateSettings = async (req, res) => {
    try {
        const { autoRollover } = req.body;

        const user = await User.findByIdAndUpdate({
            req.user.id,
            { $set: { "settings.autoRollover": autoRollover }},
            { new: true }
        });

        res.json({ success: true, settings: user.settings });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


