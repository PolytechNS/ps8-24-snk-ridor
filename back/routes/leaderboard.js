const { User } = require('../db/user');
const { getCurrentUser, getJsonBody } = require('../libs/jenkspress');
const { notFoundHandler, unauthorizedHandler } = require('./errors');

function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'top':
            top(request, response);
            break;

        case 'me':
            me(request, response);
            break;

        default:
            notFoundHandler(request, response);
    }
}

function top(request, response) {
    User.getTop().then((users) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(users));
    });
}

function me(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    User.getByName(name).then((user) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(user));
    });
}

module.exports = { manageRequest };
