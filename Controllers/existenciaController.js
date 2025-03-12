const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');

const comprobarExistencia = (req, res) => {
    try {
        const { token } = req.cookies;
        const { _sucursalId, _fecha, _produccionEstimada, _estado } = req.body;
        logger.info('Obtencion de planeacion por estado iniciada');
        if (token) {
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
              logger.warning('Token no valido');
              return res.status(401).json({ msg: 'Token no valido' });
            }
            try {
              const response = await db.one('SELECT * FROM ExistePlaneacion($1,date $2, $3, $4)', [_sucursalId, _fecha, _produccionEstimada, _estado]);
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

module.exports = {comprobarExistencia}