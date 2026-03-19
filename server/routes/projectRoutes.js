const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    createProject,
    getProjects,
    getSingleProject,
    updateProject,
    deleteProject,
    moveTask,
    inviteCollaborator,
    removeCollaborator,
} = require('../controllers/projectController');

// All project interactions require authentication
router.use(protect);

// --- Core Project CRUD ---

// @route   POST /api/projects (Create a new project)
// @route   GET /api/projects (Get all projects I own or collaborate on)
router.route('/')
    .post(createProject)
    .get(getProjects);

// @route   GET /api/projects/:id (Fetch full board data)
// @route   PUT /api/projects/:id (Edit title/description)
// @route   DELETE /api/projects/:id (Full cleanup of project & tasks)
router.route('/:id')
    .get(getSingleProject)
    .put(updateProject)
    .delete(deleteProject)

// --- Kanban & Collaboration Features ---

// @route   PUT /api/projects/:id/move (The Bridge: Moves tasks + Starts/Stops Sessions)
router.put('/:id/move', moveTask);

// @route   POST /api/projects/:id/invite (Email-based invitation + Notification)
router.post('/:id/invite', inviteCollaborator);

// @route   DELETE /api/projects/:id/collaborators/:userId (Remove a team member)
router.delete('/:id/collaborators/:userId', removeCollaborator);


module.exports = router;