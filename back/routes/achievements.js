const { notFoundHandler, unauthorizedHandler, internalServerErrorHandler } = require('./errors');
const { getJsonBody, getCurrentUser } = require('../libs/jenkspress');
const { logger } = require('../libs/logging');
const { User } = require('../db/user');
const { Achievement, ACHIEVEMENT } = require('../db/achievements');

async function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'me':
            await me(request, response);
            break;

        case 'all':
            await all(request, response);
            break;

        default:
            notFoundHandler(request, response);
    }
}

async function me(request, response) {
    // Retrieve the current user and give him his achievements
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    try {
        const user = await User.getByName(name);

        if (!user) {
            notFoundHandler(request, response);
            return;
        }

        Achievement.getAchievementByUsername(name).then((result) => {
            if (!result) {
                notFoundHandler(request, response);
                return;
            }

            response.end(JSON.stringify(result));
        });
    } catch (error) {
        logger.error(error);
        internalServerErrorHandler(request, response);
    }
}

function all(request, response) {
    // Retrieve all achievements
    response.statusCode = 200;
    response.end(JSON.stringify(ACHIEVEMENT));
}

module.exports = { manageRequest };
