const express = require('express');
const router = express.Router();
const sucursalesController = require('../Controllers/sucursalesController');

router.get('/obtener-sucursales', sucursalesController.sucursales);

module.exports = router;