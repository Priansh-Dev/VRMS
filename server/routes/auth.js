const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

module.exports = router;