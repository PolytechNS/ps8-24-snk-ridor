const { logger } = require('../libs/logging');
const { PrivateMessage } = require('../db/privateMessages');

friends = {};

function registerHandlers(io, socket) {
    logger.debug('Registering friend chat socket handlers');

    socket.on('friend:login', (username) => {
        logger.info('Socket request: friend:login');
        logger.info('Socket response: friend:list');
        friends[username] = socket.id;
        io.to(socket.id).emit('friend:friends', friends);
    });

    socket.on('disconnect', () => {
        logger.info('Socket request: friend:logout');
        delete friends[Object.keys(friends).find((key) => friends[key] === socket.id)];
        io.emit('friend:friends', friends);
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

        PrivateMessage.create(message).then(() => {
            logger.info('Friend message saved to DB');

            let receiver = friends[message.receiver];
            if (receiver) {
                logger.info('Socket response: friend:history');
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
