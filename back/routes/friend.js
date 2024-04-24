const { notFoundHandler, internalServerErrorHandler, unauthorizedHandler } = require('./errors');
const { getJsonBody, getCurrentUser } = require('../libs/jenkspress');
const { Friend, FRIEND_STATUS } = require('../db/friend');
const { logger } = require('../libs/logging');
const { User } = require('../db/user');
const { Achievement, ACHIEVEMENT } = require('../db/achievements');

async function manageRequest(request, response) {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let endpoint = url.pathname.split('/');

    switch (endpoint[3]) {
        case 'add':
            await add(request, response);
            break;

        case 'accept':
            await accept(request, response);
            break;

        case 'remove':
            await remove(request, response);
            break;

        case 'list':
            await list(request, response);
            break;

        case 'find':
            await find(request, response);
            break;

        default:
            notFoundHandler(request, response);
    }
}

async function add(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        logger.debug(`Adding friend: ${name} -> ${jsonBody.friend_name}`);

        // === Achievement ===
        if (jsonBody.friend_name === 'xXx_D4rKV3ll4_xXx') {
            logger.info(`Achievement for ${name}: VELLA`);
            User.getByName(name).then((user) => {
                if (!user) {
                    return;
                }
                Achievement.create(new Achievement(user.email, ACHIEVEMENT.VELLA)).then((_) => {});
            });
            return;
        }
        // === Achievement ===

        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            notFoundHandler(request, response);
            return;
        }

        let friendObj = new Friend(user.name, friend.name);

        const result = await Friend.create(friendObj);
        if (!result || result.error) {
            notFoundHandler(request, response);
            return;
        }

        response.end('Friend created');
    } catch (error) {
        logger.error(`Error in add function: ${error.message}`);
        internalServerErrorHandler(request, response);
    }
}

async function accept(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            notFoundHandler(request, response);
            return;
        }

        const result = await Friend.get(user.name, friend.name);
        logger.info('Accepting friend request    =     ' + jsonBody);
        if (!result) {
            notFoundHandler(request, response);
            return;
        }

        if (result.friend_name !== user.name) {
            notFoundHandler(request, response);
            return;
        }

        const updateResult = await Friend.updateStatus(friend.name, user.name, FRIEND_STATUS.ACCEPTED);
        if (!updateResult) {
            notFoundHandler(request, response);
            return;
        }

        if (updateResult.modifiedCount === 0) {
            notFoundHandler(request, response);
            return;
        }
        console.log('friend add request accepted');
        response.end('Friend accepted');
    } catch (error) {
        logger.error(`Error in accept function: ${error.message}`);
        internalServerErrorHandler(request, response);
    }
}

async function remove(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            notFoundHandler(request, response);
            return;
        }

        const result = await Friend.delete(user.name, friend.name);
        if (!result) {
            notFoundHandler(request, response);
            return;
        }

        if (result.deletedCount === 0) {
            notFoundHandler(request, response);
            return;
        }

        response.end('Friend removed');
    } catch (error) {
        logger.error(`Error in remove function: ${error.message}`);
        internalServerErrorHandler(request, response);
    }
}

async function list(request, response) {
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

        const result = await Friend.getAll(user.name);
        if (!result || result.length === 0) {
            response.end(JSON.stringify([]));
            return;
        }
        response.end(JSON.stringify(result));
    } catch (error) {
        logger.error(`Error in list function: ${error.message}`);
        internalServerErrorHandler(request, response);
    }
}

async function find(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        unauthorizedHandler(request, response);
        return;
    }

    try {
        const result = await User.getAll();
        if (!result || result.length === 0) {
            notFoundHandler(request, response);
            return;
        }

        // === Achievement ===
        const vella = {
            name: 'xXx_D4rKV3ll4_xXx',
        };
        result.push(vella);
        // === Achievement ===

        response.end(JSON.stringify(result));
    } catch (error) {
        logger.error(`Error in find function: ${error.message}`);
        internalServerErrorHandler(request, response);
    }
}

module.exports = { manageRequest };
