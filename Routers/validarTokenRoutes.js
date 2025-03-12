const express = require('express');
const router = express.Router();
const validarTokenController = require('../Controllers/validarTokenController');

router.post('/ValidarToken', validarTokenController.validarToken);

module.exports = router;