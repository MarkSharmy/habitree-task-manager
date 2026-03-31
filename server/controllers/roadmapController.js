const Roadmap = require('../models/roadmapModel');
const Task = require('../models/task');

// @desc    Create or Update a Roadmap (Save Canvas State)
// @route   POST /api/roadmaps
exports.saveRoadmap = async (req, res) => {
    try {
        const { skillName, nodes, edges, zoom, pan } = req.body;

        const roadmap = await Roadmap.findOneAndUpdate({
            { userId: req.user.id, skillName: skillName },
            {
                nodes,
                edges,
                pan, 
                userId: req.user.id
            },
            { upsert: true, new: true }
        });

        res.json({ success: true, roadmap });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get all roadmaps for the user (List View)
// @route   GET /api/roadmaps
exports.getUserRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ userId: req.user.id }).select('skillName updatedAt');

        res.json({ success: true, roadmaps });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get a specific roadmap with full node/edge data
// @route   GET /api/roadmaps/:id
exports.getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmao.findOne({ _id: req.params.id, userId: req.user.id });

        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

        res.json({ success: true, roadmap });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Delete a roadmap
// @route   DELETE /api/roadmaps/:id
exports.deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

        res.json({ success: true, message: "Roadmap deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
