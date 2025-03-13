const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET;

const validarToken = async (req, res) => {
  try {
    const { token } = req.cookies;
    logger.info('Consulta de token iniciada');

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: false });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Token verificado para el usuario ${decoded.email}`);
      res.json({ msg: true });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warning(`El token ha expirado para el usuario ${err.decoded?.email || 'desconocido'}`);
        return res.status(401).json({ msg: false, error: 'Token expirado' });
      } else if (err.name === 'JsonWebTokenError') {
        logger.warning(`Token no válido para el usuario ${err.decoded?.email || 'desconocido'}`);
        return res.status(401).json({ msg: false, error: 'Token no válido' });
      } else {
        logger.error(`Error al verificar el token para el usuario ${err.decoded?.email || 'desconocido'}:`, err);
        return res.status(500).json({ msg: false, error: 'Error al verificar el token' });
      }
    }
  } catch (error) {
    logger.error('Error grave al consultar el token:', error.message);
    res.status(500).json({ msg: false, error: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { validarToken };
