const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'task', required: true},
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Session', sessionSchema);