// models/project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "No Description" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    techStack: [{ type: String }], 
    progress: { type: Number, default: 0 },

    kanban: {
        backendBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        frontendBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        mobileBacklog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        design: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        todo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        doing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        testing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        done: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        onHold: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        trash: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

projectSchema.virtual('formattedDate').get(function() {
    const d = this.createdAt;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
});

module.exports = mongoose.model('Project', projectSchema);