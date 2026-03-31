const express = require('express');
const router = express.Router();
const { 
    saveRoadmap, 
    getUserRoadmaps, 
    getRoadmapById, 
    deleteRoadmap 
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

// All Roadmap interactions are private
router.use(protect);

router.route('/')
    .post(saveRoadmap)      // Save/Update current canvas state
    .get(getUserRoadmaps);  // Get list of all skill trees

router.route('/:id')
    .get(getRoadmapById)    // Load specific roadmap data
    .delete(deleteRoadmap); // Delete entire skill tree

module.exports = router;