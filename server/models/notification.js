const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum: ['INVITE', 'TASK_ASSIGNED', 'SYSTEM_ALERT'],
        default: 'INVITE'
    },
    message: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project' },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('notification', notificationSchema);