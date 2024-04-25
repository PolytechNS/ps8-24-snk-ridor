const { notFoundHandler, unauthorizedHandler, internalServerErrorHandler, invalidRequestHandler } = require('./errors');
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

        case 'completion':
            await completion(request, response);
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

        const achievements = await Achievement.getAchievementsByEmail(user.email);

        response.statusCode = 200;
        response.end(JSON.stringify(achievements));
    } catch (error) {
        logger.error(error);
        internalServerErrorHandler(request, response);
    }
}

async function all(request, response) {
    // Retrieve all achievements
    response.statusCode = 200;
    response.end(JSON.stringify(ACHIEVEMENT));
}

async function completion(request, response) {
    // count the number of users
    const users = await User.getAll();

    // for each of the achievement, count how much users have it
    let completion = {};

    for (let achievement in ACHIEVEMENT) {
        completion[ACHIEVEMENT[achievement].name] = 0;
    }

    logger.trace(`Users: ${JSON.stringify(users)}`);

    for (let user of users) {
        const achievements = await Achievement.getAchievementsByEmail(user.email);
        for (let achievement of achievements) {
            logger.trace(`Achievement: ${JSON.stringify(achievement)}`);
            completion[achievement.achievement.name]++;
        }
    }

    // For each achievement, calculate the percentage of users that have it and store it as an object alongside the number of users
    for (let achievement in completion) {
        completion[achievement] = { count: completion[achievement], percentage: (completion[achievement] / users.length) * 100 };
    }

    response.statusCode = 200;
    response.end(JSON.stringify(completion));
}

module.exports = { manageRequest };
