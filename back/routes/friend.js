const { notFoundHandler } = require('./errors');
const { getJsonBody, getCurrentUser } = require('../libs/jenkspress');
const { Friend, FRIEND_STATUS } = require('../db/friend');
const { logger } = require('../libs/logging');
const { User } = require('../db/user');

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
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        logger.debug(`Adding friend: ${name} -> ${jsonBody.friend_name}`);

        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            response.statusCode = 400;
            response.end('User or friend not found');
            return;
        }

        let friendObj = new Friend(user.name, friend.name);

        const result = await Friend.create(friendObj);
        if (!result || result.error) {
            response.statusCode = 400;
            if (result) {
                response.end(result.error);
                return;
            }

            response.end('Friend not created');
            return;
        }

        response.end('Friend created');
    } catch (error) {
        logger.error(`Error in add function: ${error.message}`);
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
}

async function accept(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            response.statusCode = 400;
            response.end('User or friend not found');
            return;
        }

        const result = await Friend.get(user.name, friend.name);
        logger.info('Accepting friend request    =     ' + jsonBody);
        if (!result) {
            response.statusCode = 400;
            response.end('Friend not found');
            return;
        }

        if (result.friend_name !== user.name) {
            response.statusCode = 400;
            response.end('You are not the friend recipient');
            return;
        }

        const updateResult = await Friend.updateStatus(friend.name, user.name, FRIEND_STATUS.ACCEPTED);
        if (!updateResult) {
            response.statusCode = 400;
            response.end('Friend not accepted');
            return;
        }

        if (updateResult.modifiedCount === 0) {
            response.statusCode = 400;
            response.end('Friend not accepted');
            return;
        }
        console.log('friend add request accepted');
        response.end('Friend accepted');
    } catch (error) {
        logger.error(`Error in accept function: ${error.message}`);
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
}

async function remove(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    try {
        const jsonBody = await getJsonBody(request);
        const user = await User.getByName(name);
        const friend = await User.getByName(jsonBody.friend_name);

        if (!user || !friend) {
            response.statusCode = 400;
            response.end('User or friend not found');
            return;
        }

        const result = await Friend.delete(user.name, friend.name);
        if (!result) {
            response.statusCode = 400;
            response.end('Friend not removed');
            return;
        }

        if (result.deletedCount === 0) {
            response.statusCode = 400;
            response.end('Friend not removed');
            return;
        }

        response.end('Friend removed');
    } catch (error) {
        logger.error(`Error in remove function: ${error.message}`);
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
}

async function list(request, response) {
    let name = getCurrentUser(request);
    if (!name) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    try {
        const user = await User.getByName(name);

        if (!user) {
            response.statusCode = 400;
            response.end('User not found');
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
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
}

async function find(request, response) {
    let name = getCurrentUser(request);

    if (!name) {
        response.statusCode = 401;
        response.end('Unauthorized');
        return;
    }

    try {
        const result = await User.getAll();
        if (!result || result.length === 0) {
            response.statusCode = 400;
            response.end('No users found');
            return;
        }

        response.end(JSON.stringify(result));
    } catch (error) {
        logger.error(`Error in find function: ${error.message}`);
        response.statusCode = 500;
        response.end('Internal Server Error');
    }
}

module.exports = { manageRequest };
