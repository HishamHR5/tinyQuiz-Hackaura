const express = require('express');
const { register, login, googleLogin, googleCallback, getProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Regular auth routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Protected profile route
router.get('/profile', auth, getProfile);

module.exports = router;
