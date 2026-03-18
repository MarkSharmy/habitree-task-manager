const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    createProject,
    getSingleProject,
    getProjects,
    updateProject,
    deleteProject,
    moveTask,
    addCollaborator,
    removeCollaborator,
} = require('../controllers/projectController');

router.use(protect);

//CRUD Routers
router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getSingleProject),
    .put(updateProject),
    .delete(deleteProject);

//Specialized Kanban logic
router.put(':/id/move', moveTask);

//Collborator Management
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

module.exports = router;