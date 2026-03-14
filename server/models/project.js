const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    //The Kanban structure
    kanban: {
        backendBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        frontendBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        mobileBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        design: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        todo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        doing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        testing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        done: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        onHold: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
        trash: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);

