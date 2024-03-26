const fs = require('fs');
const path = require('path');

const { logger } = require('../../libs/logging');
const { mimeTypes } = require('./mimeTypes');

const FRONT_PATH = path.join(__dirname, '/../../../front');

function sanitizeEndpoint(endpoint) {
    return endpoint.filter((element) => {
        return element !== '' && element !== '.' && element !== '..';
    });
}

function manageRequest(request, response) {
    logger.debug(`FRONT_PATH: ${FRONT_PATH}`);

    const url = new URL(request.url, `http://${request.headers.host}`);

    const endpoint = url.pathname.split('/');
    const sanitizedEndpoint = sanitizeEndpoint(endpoint);

    logger.debug(`Requested endpoint: ${sanitizedEndpoint}`);

    let filePath = path.join(FRONT_PATH, ...sanitizedEndpoint);

    logger.debug(`Requested file: ${filePath}`);

    fs.exists(filePath, async function (exist) {
        if (!exist) {
            response.statusCode = 404;
            response.end(`File ${filePath} not found!`);
            return;
        }

        if (fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        logger.debug(`Sending file: ${filePath}`);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                logger.error(`Error reading file: ${filePath}`);
                response.statusCode = 500;
                response.end();
            } else {
                response.setHeader('Content-type', mimeTypes[path.extname(filePath)] || mimeTypes.default);
                response.end(data);
            }
        });
    });
}

module.exports = { manageRequest };
