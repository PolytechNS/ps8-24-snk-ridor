function notFoundHandler(req, res) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
}

function methodNotAllowedHandler(req, res) {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
}

module.exports = { notFoundHandler, methodNotAllowedHandler };
