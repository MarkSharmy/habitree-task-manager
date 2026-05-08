const express = require('express');
const router = express.Router();
const {
    saveRoadmap,
    getUserRoadmaps,
    getRoadmapById,
    updateRoadmap,
    deleteRoadmap,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(saveRoadmap)
    .get(getUserRoadmaps);

router.route('/:id')
    .get(getRoadmapById)
    .put(updateRoadmap)
    .delete(deleteRoadmap);

module.exports = router;