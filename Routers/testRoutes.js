const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const loginLimiter = require('../Utils/rateLimiter');

router.get('/cookies', authController.getCookies);
router.get('/test-connection', authController.testConnection);
router.get('/', userController.getUsers);

module.exports = router;