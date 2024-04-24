const { verify } = require('./jwt');
const { logger } = require('./logging');
const { notFoundHandler } = require('../routes/errors');

function getJsonBody(request) {
    return new Promise((resolve) => {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

function getCurrentUser(request) {
    let token = request.headers['authorization'];
    if (!token) {
        return null;
    }

    try {
        let data = verify(token);
    } catch (error) {
        logger.error(`Error in getCurrentUser: ${error.message}`);
        return null;
    }

    if (!data) {
        return null;
    }

    logger.debug(`Current user: ${data.name}`);

    return data.name;
}

module.exports = { getJsonBody, getCurrentUser };
