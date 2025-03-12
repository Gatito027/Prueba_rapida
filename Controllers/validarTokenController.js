const jwt = require('jsonwebtoken');
const logger = require('../Utils/logger');

const validarToken = (req, res) =>{
    try {
        const {token} = req.cookies;
        logger.info('Consulta de token');
        if (token){
          jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            res.json({msg: true});
          });
        }else{
          logger.warning('Se recibio un token no valido');
          res.status(401).json({msg:false});
        }
      } catch (error) {
        logger.error('Error grave al consultar');
        res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
      }
}

module.exports = {validarToken}