const mongoose = require('mongoose');

const PlannerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    date: {
        type: String,
        require: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, { timestamps: true });

PlannerSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Planner', PlannerSchema);