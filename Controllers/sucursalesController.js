const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET;

const sucursales = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Obtención de sucursales iniciada por ${decoded.email}`);

      const response = await db.query('SELECT * FROM ObtenerSucursales()');
      res.json(response);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warning(`El token ha expirado para el usuario ${err.decoded?.email || 'desconocido'}`);
        return res.status(401).json({ msg: 'El token ha expirado.' });
      } else if (err.name === 'JsonWebTokenError') {
        logger.warning(`Token no válido para el usuario ${err.decoded?.email || 'desconocido'}`);
        return res.status(401).json({ msg: 'Token no válido.' });
      } else {
        logger.error(`Error en la consulta a la base de datos causado por ${err.decoded?.email || 'desconocido'}:`, err);
        return res.status(500).json({ msg: 'Error en la consulta a la base de datos.' });
      }
    }
  } catch (error) {
    logger.error('Error grave al consultar:', error.message);
    res.status(500).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { sucursales };
