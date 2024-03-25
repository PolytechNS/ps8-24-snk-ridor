const { User } = require('../db/user');
const { sign, verify } = require('../libs/jwt');
const { getJsonBody } = require('../libs/jenkspress');

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
    getJsonBody(request).then((jsonBody) => {
        let user = new User(jsonBody.email, jsonBody.password);

        User.create(user).then((result) => {
            if (!result || result.error) {
                response.statusCode = 400;
                if (result) {
                    response.end(result.error);
                    return;
                }

                response.end('User not created');
                return;
            }

            response.end('User created');
        });
    });
}

function login(request, response) {
    getJsonBody(request).then((jsonBody) => {
        User.get(jsonBody.email).then((result) => {
            if (!result || !result.validate_password(jsonBody.password)) {
                response.statusCode = 400;
                response.end('Invalid credentials');
                return;
            }

            let token = sign({ email: result.email });
            response.end(token);
        });
    });
}

module.exports = { manageRequest };
