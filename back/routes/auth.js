const { User } = require('../db/user');
const { sign, verify } = require('../libs/jwt');
const { getJsonBody } = require('../libs/jenkspress');
const { methodNotAllowedHandler, notFoundHandler } = require('./errors');

function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'register':
            register(request, response);
            break;

        case 'login':
            login(request, response);
            break;

        default:
            notFoundHandler(request, response);
    }
}

function register(request, response) {
    if (request.method !== 'POST') {
        methodNotAllowedHandler(request, response);
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        let user = new User(jsonBody.username, jsonBody.email, jsonBody.password);

        User.create(user).then((result) => {
            if (!result || result.error) {
                notFoundHandler(request, response);
                return;
            }

            response.end(JSON.stringify({ message: 'User created' }));
        });
    });
}

function login(request, response) {
    if (request.method !== 'POST') {
        methodNotAllowedHandler(request, response);
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        User.getByEmail(jsonBody.email).then((result) => {
            if (!result || !result.validate_password(jsonBody.password)) {
                notFoundHandler(request, response);
                return;
            }

            let token = sign({ name: result.name, email: result.email });
            response.end(
                JSON.stringify({
                    token: token,
                    username: result.name,
                    email: result.email,
                })
            );
        });
    });
}

module.exports = { manageRequest };
