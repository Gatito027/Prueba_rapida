// cspConfig.js
const helmet = require('helmet');

const cspConfig = helmet.contentSecurityPolicy({
    directives: {
        'default-src': [SELF],
        'script-src': [SELF, 'https://example.com'],
        'style-src': [SELF, 'https://example.com'],
        'img-src': [SELF, 'https://example.com'],
        'connect-src': [SELF, 'https://api.example.com'],
        'font-src': [SELF, 'https://fonts.gstatic.com'],
        'object-src': [NONE],
        'upgrade-insecure-requests': [],
    },
});

module.exports = cspConfig;
