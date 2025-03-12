const express = require('express');
const router = express.Router();
const planeacionController = require('../Controllers/planeacionController');
const { body, validationResult } = require('express-validator');

router.post('/consulta-filtro', planeacionController.filtroPorId, [body('_sucursalId').notEmpty().withMessage('El ID de la sucursal es requerido').isInt().withMessage('El ID de la sucursal debe ser un número entero'),]);
router.post('/consulta-filtro-fecha', planeacionController.consultaPorFecha, [body('_fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),]);
router.post('/consulta-filtro-estado', planeacionController.consultaPorEstado, [
    body('_estado')
      .notEmpty().withMessage('El estado es requerido')
      .isString().withMessage('El estado debe ser una cadena de texto')
      .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres'),
  ]);
router.post('/obtener-planeacion', planeacionController.consultaGeneral);
module.exports = router;