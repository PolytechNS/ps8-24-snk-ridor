const { User, hashPassword } = require('../db/user');
const { getCurrentUser, getJsonBody } = require('../libs/jenkspress');
const { notFoundHandler, unauthorizedHandler } = require('./errors');

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
            notFoundHandler(request, response);
    }
}

function updatePassword(request, response) {
    let email = getCurrentUser(request);

    if (!email) {
        unauthorizedHandler(request, response);
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        if (!jsonBody.password) {
            notFoundHandler(request, response);
            return;
        }

        let hashedPassword = hashPassword(jsonBody.password);

        User.update(email, { password_hash: hashedPassword }).then((result) => {
            if (!result || result.error) {
                notFoundHandler(request, response);
                return;
            }

            if (result.modifiedCount === 0) {
                notFoundHandler(request, response);
                return;
            }

            response.end('Password updated');
        });
    });
}

module.exports = { manageRequest };
