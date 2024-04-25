const { logger } = require('../libs/logging');
const { PrivateMessage } = require('../db/privateMessages');
const { Friend } = require('../db/friend');
const { Achievement, ACHIEVEMENT } = require('../db/achievements');
const { User } = require('../db/user');

friends = {};

function registerHandlers(io, socket) {
    logger.debug('Registering friend chat socket handlers');

    socket.on('friend:login', (username) => {
        logger.info('Socket request: friend:login');
        logger.info('Socket response: friend:list');
        friends[username] = socket.id;
        io.emit('friend:update');
    });

    socket.on('disconnect', () => {
        logger.info('Socket request: friend:logout');
        delete friends[Object.keys(friends).find((key) => friends[key] === socket.id)];
        io.emit('friend:update');
    });

    socket.on('friend:list', (_) => {
        logger.info('Socket request: friend:list');

        let name = Object.keys(friends).find((key) => friends[key] === socket.id);

        Friend.getAll(name).then((my_friends) => {
            let names = [];

            for (let friend of my_friends) {
                if (friend.status === 1) {
                    if (friend.user_name === name) {
                        names.push({ name: friend.friend_name, online: !!friends[friend.friend_name] });
                    } else {
                        names.push({ name: friend.user_name, online: !!friends[friend.user_name] });
                    }
                }
            }

            logger.info('Socket response: friend:friends');
            io.to(socket.id).emit('friend:friends', names);
        });
    });

    socket.on('friend:send', (message) => {
        logger.info('Socket request: friend:send');

        if (!message.message || !message.receiver) {
            logger.warn('Invalid message, missing message or receiver');
            return;
        }

        message.sender = Object.keys(friends).find((key) => friends[key] === socket.id);

        if (!message.sender) {
            logger.warn('Invalid sender, please use friend:login first');
            return;
        }

        User.getByName(message.sender).then((user) => {
            if (!user) {
                return;
            }

            Achievement.create(new Achievement(user.email, ACHIEVEMENT.MESSAGE)).then((_) => {});
        });

        if (message.message.toLowerCase() === 'rick') {
            User.getByName(message.sender).then((user) => {
                if (!user) {
                    return;
                }

                Achievement.create(new Achievement(user.email, ACHIEVEMENT.RICK_ROLLER)).then((_) => {});
            });

            User.getByName(message.receiver).then((user) => {
                if (!user) {
                    return;
                }

                Achievement.create(new Achievement(user.email, ACHIEVEMENT.RICK_ROLL)).then((_) => {});
            });
        }

        PrivateMessage.create(message).then(() => {
            logger.info('Friend message saved to DB');

            let receiver = friends[message.receiver];
            if (receiver) {
                logger.info('Socket response: friend:receive');
                io.to(receiver).emit('friend:receive', message);
            }
        });
    });

    socket.on('friend:history', (receiver) => {
        logger.info('Socket request: friend:history');

        // if the receiver is not set, return
        if (!receiver) {
            logger.warn('Invalid receiver');
            return;
        }

        let sender = Object.keys(friends).find((key) => friends[key] === socket.id);

        PrivateMessage.get(sender, receiver).then((messages) => {
            logger.info('Socket response: friend:message_history');
            io.to(socket.id).emit('friend:message_history', messages);
        });
    });
}

module.exports = { registerHandlers };
