const logger = require('../Utils/logger');

const logout = (req, res) => {
  try {
    logger.info('Token finalizado');
    res.cookie('token', '').json(true); // Borrar la cookie del token
  } catch (error) {
    logger.error('Error al borrar token');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
};

module.exports = { logout };