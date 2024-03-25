const { User, hashPassword } = require('../db/user');
const { getCurrentUser, getJsonBody } = require('../libs/jenkspress');
const { logger } = require('../libs/logging');
const { json } = require('mocha/lib/reporters');

function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'update':
            update(request, response);
            break;

        case 'update_password':
            updatePassword(request, response);
            break;

        default:
            response.statusCode = 400;
            response.end('Unknown endpoint');
    }
}

function updatePassword(request, response) {
    getCurrentUser(request).then((email) => {
        if (!email) {
            response.statusCode = 401;
            response.end('Unauthorized');
            return;
        }

        getJsonBody(request).then((jsonBody) => {
            if (!jsonBody.password) {
                response.statusCode = 400;
                response.end('Password is required');
                return;
            }

            let hashedPassword = hashPassword(jsonBody.password);

            User.update(email, { password_hash: hashedPassword }).then((result) => {
                if (!result || result.error) {
                    response.statusCode = 400;

                    if (result) {
                        response.end(result.error);
                        return;
                    }

                    response.end('Password not updated');
                    return;
                }

                if (result.modifiedCount === 0) {
                    response.statusCode = 400;
                    response.end('Password not updated');
                    return;
                }

                response.end('Password updated');
            });
        });
    });
}

module.exports = { manageRequest };
