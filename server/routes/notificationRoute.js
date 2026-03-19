const express = require('express');
const router = express.Router();
const { getNotifications, readNotification } = require('../controllers/notifcationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Get all invites/alerts for the user
router.get('/', getNotifications);

//Mark as read when clicked
router.put('/:id/read', readNotification);

module.exports = router;