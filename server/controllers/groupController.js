const Task = require('../models/task');
const Group = require('../models/group');

exports.createGroup = async (req, res) => {
    try {
         const group = await Group.create({
            userId: req.user.id,
            name: req.body.name,
            color: req.body.color
         });

         res.status(201).json(group);

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ userId: req.user.id });
        res.json(groups);
    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const group = await Group.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name: req.body.name, color: req.body.color },
            { new: true, runValidators: true }
        );

        if(!group) return res.status(404).json({ success:false, message: "Group not found" });
        res.json(group);

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findOne({ _id: req.params.id, userId: req.user.id });

        if(!group) return res.status(404).json({ success: false, message: "Group not found" });
        
        // Important: Dissociate tasks from this group before deleting the group
        // This prevents "orphaned" tasks and moves them to "Uncategorized"
        await Task.updateMany(
            { groupId: req.params.id, userId: req.user.id },
            { groupId: null }
        );

        await group.deleteOne();
        res.json({ success: true, message: "Group removed and tasks uncategorized" });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
};