const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and return token
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get user data
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
