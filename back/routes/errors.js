function notFoundHandler(req, res) {
    res.statusCode = 404;
    res.end('Not found');
}

module.exports = { notFoundHandler };
