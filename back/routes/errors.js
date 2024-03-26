function notFoundHandler(req, res) {
    res.statusCode = 404;
    res.end('Not found');
}

function methodNotAllowedHandler(req, res) {
    res.statusCode = 405;
    res.end('Method not allowed');
}

module.exports = { notFoundHandler, methodNotAllowedHandler };
