const jwt = require('jsonwebtoken');
const { logger } = require('./logging');

let default_secret = 'Zo2yU9#sB9ZBtruAip*^XAEW4ectaXvfokK^D8sSdVwahBf*JuuJ2Jr$!jd!zE6eikA';
let secret = process.env.JWT_SECRET || default_secret;

if (secret === default_secret) {
    logger.warn('Warning: JWT_SECRET is not set, using default secret. This is not secure!');
}

function sign(payload) {
    return jwt.sign(payload, secret);
}

function verify(token) {
    return jwt.verify(token, secret);
}

module.exports = { sign, verify };
