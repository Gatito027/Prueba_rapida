const express = require('express');
const router = express.Router();
const loginLimiter = require('../Utils/rateLimiter');
const { body } = require('express-validator');
const { validarErrores } = require('../Utils/expressValidator');
const validarTokenController = require('../Controllers/validarTokenController');
const sucursalesController = require('../Controllers/sucursalesController');
const userController = require('../Controllers/userController');
const planeacionController = require('../Controllers/planeacionController');
const logoutController = require('../Controllers/logoutController');
const existenciaController = require('../Controllers/existenciaController');
const loginController = require('../Controllers/loginController');

//* Rutas del proyecto
router.get('/', userController.getUsers);

router.get('/ValidarToken', validarTokenController.validarToken);

router.get('/obtener-sucursales', sucursalesController.sucursales);

router.get('/consulta-filtro', [
    body('_sucursalId')
      .notEmpty().withMessage('El ID de la sucursal es requerido')
      .isInt().withMessage('El ID de la sucursal debe ser un número entero')
  ],
  validarErrores,
  planeacionController.filtroPorId
);

router.get('/consulta-filtro-fecha', [
    body('_fecha')
      .notEmpty().withMessage('La fecha es requerida')
      .isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
  ],
  validarErrores,
  planeacionController.consultaPorFecha
);

router.get('/consulta-filtro-estado', [
    body('_estado')
      .notEmpty().withMessage('El estado es requerido')
      .isString().withMessage('El estado debe ser una cadena de texto')
      .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres')
  ],
  validarErrores,
  planeacionController.consultaPorEstado
);

router.get('/obtener-planeacion', planeacionController.consultaGeneral);

router.get('/consulta-existecia-produccion', [
    body('_sucursalId')
      .notEmpty().withMessage('El ID de la sucursal es requerido')
      .isInt().withMessage('El ID de la sucursal debe ser un número entero'),
    body('_fecha')
      .notEmpty().withMessage('La fecha es requerida')
      .isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
    body('_produccionEstimada')
      .notEmpty().withMessage('La producción estimada es requerida')
      .isNumeric().withMessage('La producción estimada debe ser un número'),
    body('_estado')
      .notEmpty().withMessage('El estado es requerido')
      .isString().withMessage('El estado debe ser una cadena de texto')
      .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres')
  ],
  validarErrores,
  existenciaController.comprobarExistencia
);

router.post('/logout', logoutController.logout);

router.post('/login', [
    body('_email').isEmail().withMessage('Email inválido'),
    body('_password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
  ],
  validarErrores,
  loginLimiter,
  loginController.login
);

module.exports = router;
