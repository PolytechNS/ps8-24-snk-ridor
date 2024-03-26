const { User } = require('../db/user');
const { sign, verify } = require('../libs/jwt');
const { getJsonBody } = require('../libs/jenkspress');
const { methodNotAllowedHandler } = require('./errors');

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
            response.statusCode = 400;
            response.end('Unknown endpoint');
    }
}

function register(request, response) {
    if (request.method !== 'POST') {
        methodNotAllowedHandler(request, response);
        return;
    }

    getJsonBody(request).then((jsonBody) => {
        let user = new User(jsonBody.email, jsonBody.password);

        User.create(user).then((result) => {
            if (!result || result.error) {
                response.statusCode = 400;
                if (result) {
                    response.end(result.error);
                    return;
                }

                response.end(JSON.stringify({ error: 'User not created' }));
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
        User.get(jsonBody.email).then((result) => {
            if (!result || !result.validate_password(jsonBody.password)) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }

            let token = sign({ email: result.email });
            response.end(JSON.stringify({ token: token }));
        });
    });
}

module.exports = { manageRequest };
