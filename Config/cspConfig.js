const helmet = require('helmet');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',');

const SELF = "'self'";
const NONE = "'none'";

const cspConfig = helmet.contentSecurityPolicy({
    directives: {
        'default-src': [SELF, ...ALLOWED_ORIGINS],
        'script-src': [SELF, ...ALLOWED_ORIGINS],
        'style-src': [SELF, ...ALLOWED_ORIGINS],
        'img-src': [SELF, ...ALLOWED_ORIGINS],
        'connect-src': [SELF, ...ALLOWED_ORIGINS],
        'font-src': [SELF, 'https://fonts.gstatic.com'],
        'object-src': [NONE],
        'upgrade-insecure-requests': [],
    },
});

module.exports = cspConfig;