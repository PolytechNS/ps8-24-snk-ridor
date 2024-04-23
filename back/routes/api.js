const auth = require('./auth');
const friend = require('./friend');
const user = require('./user');
const leaderboard = require('./leaderboard');

function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[2]) {
        case 'auth':
            auth.manageRequest(request, response);
            break;

        case 'friend':
            friend.manageRequest(request, response);
            break;

        case 'user':
            user.manageRequest(request, response);
            break;

        case 'leaderboard':
            leaderboard.manageRequest(request, response);
            break;

        default:
            response.statusCode = 400;
            response.end('Unknown endpoint');
    }
}

module.exports = { manageRequest };
