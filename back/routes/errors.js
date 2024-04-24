const { logger } = require('../libs/logging');

function invalidRequestHandler(req, res) {
    baseHandler(req, res, 400, 'Invalid request');
}

function unauthorizedHandler(req, res) {
    baseHandler(req, res, 401, 'Unauthorized');
}

function forbiddenHandler(req, res) {
    baseHandler(req, res, 403, 'Forbidden');
}

function notFoundHandler(req, res) {
    baseHandler(req, res, 404, 'Not found');
}

function methodNotAllowedHandler(req, res) {
    baseHandler(req, res, 405, 'Method not allowed');
}

function internalServerErrorHandler(req, res, error = '') {
    baseHandler(req, res, 500, `Internal server error: ${error}`);
}

function baseHandler(req, res, code, message) {
    res.statusCode = code;
    res.end(JSON.stringify({ error: message }));
    logger.info(`Error ${code}: ${message}`);
}

module.exports = { invalidRequestHandler, unauthorizedHandler, forbiddenHandler, notFoundHandler, methodNotAllowedHandler, internalServerErrorHandler };
