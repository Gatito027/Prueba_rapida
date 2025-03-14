const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // * cambiar el valor a Máximo 5 intentos
    message: 'Demasiados intentos de login, intenta más tarde',
});

module.exports = loginLimiter;