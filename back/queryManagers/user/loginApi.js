const { createUser, getUser } = require('../../database/database.js');
const jwt = require('jsonwebtoken');
const { sha256 } = require('js-sha256');
const { jsonValidator } = require('../../util/jsonValidator');

const schema = {
    username: 'string',
    mail: 'string',
    password: 'string',
};
const JWTSecretCode =
    'q55fjgo3B8tN75uWK7LyLqSMDbCJodaET5mJ4w5XCRuqmhtQ465xy7N8rU5uAo8w4tev3JesbY5wy' +
    '7CLp6EFp885VJvgGw6hMB69tQrP9E9B9fbuyALf4gFCt3imdwLu';

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function checkUserConstraints(user) {
    if (user.username.length > 16 || user.username.length === 0) {
        throw new Error(
            `The length of username field ${user.username.length} is invalid, should be between 1 and 16`
        );
    }

    if (!validateEmail(user.mail)) {
        throw new Error(`The email field ${user.mail} is invalid`);
    }

    if (user.password.length === 0) {
        throw new Error(`The password is empty`);
    }
}

function hashPassword(data) {
    data.password = sha256(data.password);
    return data;
}

function convertSignUp(data) {
    return hashPassword(jsonValidator(data, schema));
}

function convertLogin(data) {
    return hashPassword(jsonValidator(data, schema));
}

function handleSignup(request, response) {
    let user;
    try {
        user = convertSignUp(request['body']);
        checkUserConstraints(user);
    } catch (err) {
        console.log('User not valid: ', err);
        sendResponse(
            response,
            400,
            'The object user is malformed ' + JSON.stringify(err)
        );
        return;
    }

    createUser(user)
        .then((userCreated) => {
            // Everything went well, we can send a response.
            sendResponse(response, 201, 'OK');
        })
        .catch((err) => {
            console.log('User not added: ', err);
            sendResponse(
                response,
                409,
                'User not created: ' + JSON.stringify(err)
            );
        });
}

function handleLogin(request, response) {
    let user;
    try {
        user = convertLogin(request['body']);
    } catch (err) {
        console.log('User not found ', err);
        sendResponse(response, 404, 'User not found: ' + JSON.stringify(err));
        return;
    }

    getUser(user)
        .then((userFound) => {
            let payload = {
                userId: userFound._id.toString(),
                username: userFound.username,
            };

            let token = jwt.sign(payload, JWTSecretCode, { expiresIn: '1d' });
            sendResponse(response, 200, token);
        })
        .catch((err) => {
            console.log('User not found: ', err);
            sendResponse(
                response,
                404,
                'User not found: ' + JSON.stringify(err)
            );
        });
}
function sendResponse(response, statusCode, message) {
    response.statusCode = statusCode;
    response.end(message);
}

module.exports = { handleSignup, handleLogin };
