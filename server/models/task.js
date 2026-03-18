const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },

    //Categorization
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    category: {
        type: String,
        enum: ['General', 'Watch', 'Read', 'Practice', 'Note', 'Project'],
        default: 'General'
    },

    //Execution logic
    status: {
        type: String,
        enum: ['Not Started', 'On-Going', 'Completed', 'Shelved'],
        default: 'Not Started'
    },
    subtasks: [SubtaskSchema],

    //Daily Planner Integration
    scheduledDate: { type: Date, default: null },

    //Stats for the efficiency score
    totalTimeSpent: { type: Number, default: 0 }, //in seconds
    estimatedTime: { type: Number, default: 3600 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);

