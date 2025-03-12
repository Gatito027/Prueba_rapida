const db = require('../Config/database');
const logger = require('../Utils/logger');

const getCookies = (req, res) => {
    logger.info('Obteniendo cookies');
    res.json({ Cookies: req.cookies, SignedCookies: req.signedCookies });
};

const testConnection = async (req, res) => {
    try {
        const result = await db.any('SELECT 1');
        res.send('Conexión exitosa: ' + JSON.stringify(result));
    } catch (error) {
        logger.error('Error en la conexión: ' + error.message);
        res.send('Error en la conexión: ' + error.message);
    }
};

module.exports = { getCookies, testConnection };