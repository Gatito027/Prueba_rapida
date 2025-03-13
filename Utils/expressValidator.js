
const { body, validationResult } = require('express-validator');

// Middleware para manejar la validación de errores
const validarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

module.exports = { validarErrores }