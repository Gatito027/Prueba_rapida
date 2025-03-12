const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');

const filtroPorId =  (res, req) => {
    try {
        const { token } = req.cookies;
        const { _sucursalId } = req.body;
        logger.info('Obtencion de planeacion por sucursal iniciada');
        if (token) {
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
              logger.warning('Token no valido');
              return res.status(401).json({ msg: 'Token no valido' });
            }
            try {
              const response = await db.query('SELECT * FROM ObtenerPlaneacion(int $1)', [_sucursalId]);
              res.json(response);
            } catch (dbError) {
              logger.error('Error en la consulta a la base de datos');
              res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
            }
          });
        } else {
          logger.warning('Se recibio un token no valido');
          res.status(401).json({ msg: 'Token no valido' });
        }
      } catch (error) {
        logger.error('Error grave al consultar por sucursal');
        res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
      }
}

const consultaPorFecha = (req, res) => {
    try {
        const { token } = req.cookies;
        const { _fecha } = req.body;
        logger.info('Obtencion de planeacion por fecha iniciada');
        if (token) {
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
              logger.warning('Token no valido');
              return res.status(401).json({ msg: 'Token no valido' });
            }
            try {
              const response = await db.query('SELECT * FROM ObtenerPlaneacion(date $1)', [_fecha]);
              res.json(response);
            } catch (dbError) {
              logger.error('Error en la consulta a la base de datos');
              res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
            }
          });
        } else {
          logger.warning('Se recibio un token no valido');
          res.status(401).json({ msg: 'Token no valido' });
        }
      } catch (error) {
        logger.error('Error grave al consultar por fecha');
        res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
      }
}

const consultaPorEstado = (req, res) => {
    try {
        const { token } = req.cookies;
        const { _estado } = req.body;
        logger.info('Obtencion de planeacion por estado iniciada');
        if (token) {
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
              logger.warning('Token no valido');
              return res.status(401).json({ msg: 'Token no valido' });
            }
            try {
              const response = await db.query('SELECT * FROM ObtenerPlaneacion(varchar $1)', [_estado]);
              res.json(response);
            } catch (dbError) {
              logger.error('Error en la consulta a la base de datos');
              res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
            }
          });
        } else {
          logger.warning('Se recibio un token no valido');
          res.status(401).json({ msg: 'Token no valido' });
        }
      } catch (error) {
        logger.error('Error grave al consultar por estado');
        res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
      }
}

const consultaGeneral = (req, res) => {
    try {
        const { token } = req.cookies;
        logger.info('Obtencion de planeacion iniciada');
        if (token) {
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
              logger.warning('Token no valido');
              return res.status(401).json({ msg: 'Token no valido' });
            }
            try {
              const response = await db.query('SELECT * FROM ObtenerPlaneacion()');
              res.json(response);
            } catch (dbError) {
              logger.error('Error en la consulta a la base de datos');
              res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
            }
          });
        } else {
          logger.warning('Se recibio un token no valido');
          res.status(401).json({ msg: 'Token no valido' });
        }
      } catch (error) {
        logger.error('Error grave al consultar la consulta');
        res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
      }
}

module.exports = {filtroPorId, consultaPorFecha, consultaPorEstado, consultaGeneral}