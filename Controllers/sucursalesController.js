const db = require('../Config/database');
const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');

const sucursales = (res, req) => {
    try {
        const {token} = req.cookies;
        logger.info('Obtencion de sucursales iniciada');
        if (token){
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            const response = await db.query('SELECT * FROM ObtenerSucursales()');
            res.json(response);
          });
        }else{
          logger.warning('Se recibio un token no valido');
          res.status(401).json({msg:'Token no valido'});
        }
      } catch (error) {
        logger.error('Error grave al consultar');
        res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
      }
}

module.exports = {sucursales};