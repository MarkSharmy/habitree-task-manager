const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');
const Session = require('../models/session');
const Notification = require('../models/notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new project
// @route   POST /api/projects
exports.createProject = async(req, res) => {
    try {
        const { name, description, collaborators, techStack } = req.body;
        
        const project = await Project.create({
            name,
            description: description || "No Description",
            owner: req.user.id,
            collaborators: collaborators || [],
            techStack: techStack || [],
            progress: 0 
        });

        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get project matching ID
// @route   GET /api/projects/:id
exports.getSingleProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate({
                path: 'kanban.backendBacklog kanban.frontendBacklog kanban.mobileBacklog kanban.design kanban.todo kanban.doing kanban.testing kanban.done',
                populate: { path: 'assignee', select: 'username avatar' }
            });

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        res.json({ success: true, project });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get all projects user is part of (Owner or Collaborator)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ owner: req.user.id }, { collaborators: req.user.id }]
        })
        .populate('owner', 'username email avatar')
        .populate('collaborators', 'username avatar');

        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { $set: req.body },
            { new: true, runValidators: true}
        );

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        res.json({ success: true, project})
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Delete a project and its associated tasks
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });

        if(!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const allTasksIds = Object.values(project.kanban).flat();
        await Task.deleteMany({ _id: { $in: allTasksIds }});

        await project.deleteOne();
        res.json({ success: true, message: "Project and associated tasks deleted" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Move task between Kanban columns (The Bridge)
// @route   PUT /api/projects/:id/move
exports.moveTask = async(req, res) => {
    const { taskId, fromColumn, toColumn } = req.body;
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);
        if(!project) return res.status(404).json({ success: false, message: 'Project not found' });

        project.kanban[fromColumn] = project.kanban[fromColumn].filter(id => id.toString() !== taskId);
        project.kanban[toColumn].push(taskId);

        if (toColumn === 'doing') {
            const existingSession = await Session.findOne({ taskId, userId: req.user.id, isCompleted: false });
            if(!existingSession) {
                await Session.create({
                    userId: req.user.id,
                    taskId: taskId,
                    startTime: Date.now()
                });
            }
            await Task.findByIdAndUpdate(taskId, { status: 'Doing', scheduledDate: new Date() });
        }

        if(fromColumn === 'doing') {
            const activeSession = await Session.findOne({ taskId, userId: req.user.id, isCompleted: false });
            if(activeSession) {
                const endTime = Date.now();
                const durationSeconds = Math.floor((endTime - activeSession.startTime) / 1000);
                
                activeSession.endTime = endTime;
                activeSession.duration = durationSeconds;
                activeSession.isCompleted = true;
                await activeSession.save();

                await Task.findByIdAndUpdate(taskId, { $inc: { totalTimeSpent: durationSeconds } });
            }
        }

        await project.save();
        req.io.to(projectId).emit('taskMoved', { taskId, fromColumn, toColumn, user: req.user.username });
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Add a collaborator to a project
// @route   POST /api/projects/:id/collaborators
exports.addCollaborator = async (req, res) => {

    const { email } = req.body;

    try {
        // 1. Find the project and ensure the requester is the owner
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });

        if(!project) return res.status(404).json({ success: false, message: 'Project not found or not authorized '});

        // 2. Find the user to be added
        const userToAdd = await User.findOne({ email });
        if(!userToAdd) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 3. Prevent adding the owner as a collaborator
        if(userToAdd._id.toString() === project.owner.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot add owner as collaborator' });
        }

        //4. Check if user is already a collabotatot
        if (project.collaborators.includes(userToAdd._id)) {
            return res.status(400).json({ success: false, message: 'User already a collaborator' });
        }

        //5. Add user and save
        project.collaborators.push(userToAdd._id);

        await project.save();
        return res.status(200).json({ success: true, message: 'Collaborator added '});
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Remove a collaborator from a project
// @route   DELETE /api/projects/:id/collaborators/:userId
exports.removeCollaborator = async (req, res) => {
    try{
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found or not authorized' });
        }

        // Remove the userId from the list of collaborators
        project.collaborators = project.collaborators.filter(
            (collabId) => collabId.toString() !== req.params.userId
        );

        await project.save();
        return res.status(200).json({ success: true, message: 'Collaborator removed '});

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Invite a collaborator via email
// @route   POST /api/projects/:id/invite
exports.inviteCollaborator = async (req, res) => {
    const { email } = req.body;
    const projectId = req.params.id;

    try {
        // 1. Find the project and verify the requester is the owner
        const project = await Project.findOne({ _id: projectId, owner: req.user.id });
        if(!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // 2. Find the recipient user in the database
        const recipient = await User.findOne({ email });
        if(!recipient) return res.status(404).json({ success: false, message: 'User not found' });

        // 3. Prevent adding the owner or duplicate collaborators
        if (recipient._id.toString() === project.owner.toString()) {
            return res.status(400).json({ success: false, message: 'You are already the owner of this project' });
        }

        if (project.collaborators.includes(recipient._id)) {
            return res.status(400).json({ message: 'User already a collaborator'});
        }

        // 4. Update the Project Schema
        project.collaborators.push(recipient._id);
        await project.save();

        // 5. Notify the recipient via Email
        const notification = await Notification.create({
            recipient: recipient._id,
            sender: req.user.id,
            type: 'INVITE',
            message: `You have been added to the project: ${project.name}`,
            projectId: project._id,
        });

        // 6. Send socket io Alert (Live)
        req.io.to(recipient._id.toString()).emit('newNotification', notification);

        // 7. Send Email (Offline)
        //await sendEmail({email: recipient.email, ...});

        res.json({ success: true, message: "Collaborator invited successfully" });

    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}