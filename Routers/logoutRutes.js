const express = require('express');
const router = express.Router();
const logoutController = require('../Controllers/logoutController');

router.post('/logout', logoutController.logout);

module.exports = router;