const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/workers', userController.getWorkers);
router.get('/profile/:userId', userController.getPublicProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
