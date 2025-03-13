const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET;

const filtroPorId = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _sucursalId } = req.body;

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Obtención de planeación por sucursal iniciada por ${decoded.email}`);
      
      const response = await db.query('SELECT * FROM ObtenerPlaneacion(int $1)', [_sucursalId]);
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
    logger.error('Error grave al consultar por sucursal:', error.message);
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

const consultaPorFecha = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _fecha } = req.body;

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Obtención de planeación por fecha iniciada por ${decoded.email}`);

      const response = await db.query('SELECT * FROM ObtenerPlaneacion(date $1)', [_fecha]);
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
    logger.error('Error grave al consultar por fecha:', error.message);
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

const consultaPorEstado = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _estado } = req.body;

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Obtención de planeación por estado iniciada por ${decoded.email}`);

      const response = await db.query('SELECT * FROM ObtenerPlaneacion($1)', [_estado]);
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
    logger.error('Error grave al consultar por estado:', error.message);
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

const consultaGeneral = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      logger.warning('Se recibió un token no válido.');
      return res.status(401).json({ msg: 'Token no válido' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info(`Obtención de planeación iniciada por ${decoded.email}`);

      const response = await db.query('SELECT * FROM ObtenerPlaneacion()');
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
    logger.error('Error grave al consultar la planeación:', error.message);
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { filtroPorId, consultaPorFecha, consultaPorEstado, consultaGeneral };
