const logger = require('../Utils/logger');

const getUsers = (req, res) => {
    logger.info('Obteniendo usuarios');
    res.json('¡Hi, World!, in express');
};

module.exports = { getUsers };