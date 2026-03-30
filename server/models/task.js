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
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
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
    
}, { timestamps: true });

//Middleware to calculate progress and sync with Roadmaps
TaskSchema.post('save', async function(doc) {

    // 1. Calculate progress percentage based on subtasks
    let progress = 0;
    if (doc.subtasks && doc.subtasks.length > 0) {
        const completed = doc.subtasks.filter(st => st.isCompleted).length;
        progress = Math.round((completed / doc.subtasks.length) * 100);
    }
    else if (doc.status === 'Completed') {
        progress = 100;
    }

    // 2. Update all Roadmaps that contain this task as a node
    const Roadmap = mongoose.model('Roadmap');
    await Roadmap.updateMany(
        { "nodes.id": doc._id.toString() },
        {
            $set: {
                "nodes.$.data.progress": progress,
                "nodes.$.data.status": doc.status
            }
        }
    );

});

module.exports = mongoose.model('Task', TaskSchema);

