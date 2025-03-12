const express = require('express');
const router = express.Router();
const loginController = require('../Controllers/loginController');
const loginLimiter = require('../Utils/rateLimiter');

router.post('/login', loginLimiter, loginController.login);

module.exports = router;