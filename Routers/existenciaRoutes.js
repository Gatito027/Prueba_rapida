const express = require('express');
const router = express.Router();
const existenciaController = require('../Controllers/existenciaController');
const { body, validationResult } = require('express-validator');

router.post('/consulta-existecia-produccion', existenciaController.comprobarExistencia, [
    body('_sucursalId').notEmpty().withMessage('El ID de la sucursal es requerido').isInt().withMessage('El ID de la sucursal debe ser un número entero'),
    body('_fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
    body('_produccionEstimada').notEmpty().withMessage('La producción estimada es requerida').isNumeric().withMessage('La producción estimada debe ser un número'),
    body('_estado')
      .notEmpty().withMessage('El estado es requerido')
      .isString().withMessage('El estado debe ser una cadena de texto')
      .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres'),
  ]);

module.exports = router;