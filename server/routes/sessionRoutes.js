const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { saveSession } = require('../controllers/sessionController');

router.use(protect);

router.post('/save', saveSession);

module.exports = router;
