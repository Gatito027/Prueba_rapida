const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');
const jwtSecret = process.env.JWTSECRET;
require('dotenv').config();

const comprobarExistencia = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    const { _sucursalId, _fecha, _produccionEstimada, _estado } = req.body;

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info('Obtención de planeación por estado iniciada por ', decoded.email);
      const response = await db.one('SELECT * FROM ExistePlaneacion(int $1,date $2,int $3, $4)', [_sucursalId, _fecha, _produccionEstimada, _estado]);
      res.json(response);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warning('El token ha expirado para el usuario ', err.decoded?.email || 'desconocido');
        return res.status(401).json({ msg: 'Token ha expirado' });
      } else if (err.name === 'JsonWebTokenError') {
        logger.warning('Token no válido para el usuario ', err.decoded?.email || 'desconocido');
        return res.status(401).json({ msg: 'Token no válido' });
      } else {
        logger.error('Error al verificar el token:', err);
        return res.status(500).json({ msg: 'Error al verificar el token' });
      }
    }
  } catch (error) {
    logger.error('Error grave al consultar si está la planeación:', error);
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { comprobarExistencia };
