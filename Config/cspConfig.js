// cspConfig.js
const helmet = require('helmet');

const cspConfig = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "example.com"],
        styleSrc: ["'self'", "example.com"],
        imgSrc: ["'self'", "example.com"],
        connectSrc: ["'self'", "api.example.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    },
});

module.exports = cspConfig;
