const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCurrentUser,
    updateProfile,
    updateSettings,
} = require('../controllers/userController');

router.use(protect);

// @route   GET /api/users/me
router.get('/me', getCurrentUser);

// @route   PUT /api/users/me
router.put('/me', updateProfile);

// @route   PATCH /api/users/settings
router.patch('/settings', updateSettings);

module.exports = router;