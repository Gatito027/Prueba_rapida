const logger = require('../Utils/logger');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET;

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      logger.warn('No se encontró token en las cookies.');
      return res.status(401).json({ msg: 'No se encontró token.' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.info('Token eliminado para ', decoded.email);
      res.cookie('token', '', { sameSite: 'none', secure: true, httpOnly: true }).json(true); // Borrar la cookie del token
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('El token ha expirado.');
        return res.status(401).json({ msg: 'El token ha expirado.' });
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('Token no válido.');
        return res.status(401).json({ msg: 'Token no válido.' });
      } else {
        logger.error('Error al verificar el token:', error);
        return res.status(500).json({ msg: 'Error al verificar el token.' });
      }
    }
  } catch (error) {
    logger.error('Error grave al borrar token:', error.message);
    res.status(500).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { logout };
