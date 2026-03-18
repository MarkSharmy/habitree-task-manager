const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { startSession, stopSession } = require('../controllers/sessionController');

router.use(protect);

router.post('/start', startSession);
router.put('/stop/:id', stopSession);

module.exports = router;
