const { verify } = require('./jwt');
const { logger } = require('./logging');

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

    let data = verify(token);

    if (!data) {
        return null;
    }

    logger.debug(`Current user: ${data.email}`);

    return data.email;
}

module.exports = { getJsonBody, getCurrentUser };
