const { notFoundHandler } = require('./errors');
const { getJsonBody, getCurrentUser } = require('../libs/jenkspress');
const { Friend, FRIEND_STATUS } = require('../db/friend');
const { logger } = require('../libs/logging');
const { User } = require('../db/user');

function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'add':
            add(request, response);
            break;

        case 'accept':
            accept(request, response);
            break;

        case 'remove':
            remove(request, response);
            break;

        case 'list':
            list(request, response);
            break;

        case 'find':
            find(request, response);
            break;

        default:
            notFoundHandler(request, response);
    }
}

function add(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        logger.debug(`Adding friend: ${email} -> ${jsonBody.friend_email}`);
        let friend = new Friend(email, jsonBody.friend_email);

        Friend.create(friend).then((result) => {
            if (!result || result.error) {
                response.statusCode = 400;
                if (result) {
                    response.end(result.error);
                    return;
                }

                response.end('Friend not created');
                return;
            }

            response.end('Friend created');
        });
    });
}

function accept(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        Friend.get(email, jsonBody.friend_email).then((result) => {
            if (!result) {
                response.statusCode = 400;
                response.end('Friend not found');
                return;
            }

            if (result.friend_email !== email) {
                response.statusCode = 400;
                response.end('You are not the friend recipient');
                return;
            }

            Friend.updateStatus(jsonBody.friend_email, email, FRIEND_STATUS.ACCEPTED).then((result) => {
                if (!result) {
                    response.statusCode = 400;
                    response.end('Friend not accepted');
                    return;
                }

                if (result.modifiedCount === 0) {
                    response.statusCode = 400;
                    response.end('Friend not accepted');
                    return;
                }

                response.end('Friend accepted');
            });
        });
    });
}

function remove(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        Friend.delete(email, jsonBody.friend_email).then((result) => {
            if (!result) {
                response.statusCode = 400;
                response.end('Friend not removed');
                return;
            }

            if (result.deletedCount === 0) {
                response.statusCode = 400;
                response.end('Friend not removed');
                return;
            }

            response.end('Friend removed');
        });
    });
}

function list(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    Friend.getAll(email).then((result) => {
        if (!result) {
            response.statusCode = 400;
            response.end('No friends found');
            return;
        }

        response.end(JSON.stringify(result));
    });
}

function find(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    User.getAll().then((result) => {
        if (!result) {
            response.statusCode = 400;
            response.end('No users found');
            return;
        }

        response.end(JSON.stringify(result));
    });
}

module.exports = { manageRequest };
