const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createGroup, getGroups, updateGroup, deleteGroup } = require('../controllers/groupController');

//All group routes are protected
router.use(protect);

router.route('/').get(getGroups).post(createGroup);
router.route('/:id').put(updateGroup).delete(deleteGroup);

module.exports = router;