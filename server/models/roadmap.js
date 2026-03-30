const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    // id matches the Task ObjectId string for easy lookup
    id: { type: String, required: true }, 
    type: { type: String, default: 'taskNode' },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    // Data passed to React Flow / Mobile SVG viewer
    data: {
        label: { type: String },
        // Reactive fields derived from the associated Task
        progress: { type: Number, default: 0 },
        status: { type: String, default: 'Not Started' }
    }
});

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    source: { type: String, required: true }, // Source Task ID
    target: { type: String, required: true }, // Target Task ID
    animated: { type: Boolean, default: false },
    label: { type: String, default: '' }
});

const roadmapSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    skillName: { 
        type: String, 
        required: true // e.g., "Master MERN Stack"
    },
    // The collection of tasks (nodes) and their dependencies (edges)
    nodes: [nodeSchema],
    edges: [edgeSchema],
    // Viewport state to persist user's visual layout
    zoom: { type: Number, default: 1 },
    pan: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);