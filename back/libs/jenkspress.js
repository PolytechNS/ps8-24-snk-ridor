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
    return new Promise((resolve) => {
        let token = request.headers['authorization'];
        if (!token) {
            resolve(null);
            return;
        }

        let data = verify(token);

        if (!data) {
            resolve(null);
            return;
        }

        logger.debug(`Current user: ${data.email}`);

        resolve(data.email);
    });
}

module.exports = { getJsonBody, getCurrentUser };
