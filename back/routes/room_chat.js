const { logger } = require('../libs/logging');

rooms = {};

function purgeEmptyRooms() {
    for (let room in rooms) {
        if (rooms[room].length === 0) {
            delete rooms[room];
        }
    }
}

function registerHandlers(io, socket) {
    logger.debug('Registering room chat socket handlers');

    socket.on('message:list', (_) => {
        logger.info('Socket request: message:list');
        logger.info('Socket response: message:rooms');
        io.to(socket.id).emit('message:rooms', rooms);
    });

    socket.on('message:join', (room_hash) => {
        logger.info('Socket request: message:join');

        // check if the socket is already in any room
        if (Object.keys(rooms).find((room) => rooms[room].includes(socket.id))) {
            logger.warn(`Socket ${socket.id} is already in room ${room_hash}`);
            return;
        }

        rooms[room_hash] = rooms[room_hash] || [];
        rooms[room_hash].push(socket.id);

        purgeEmptyRooms();

        logger.debug(`${socket.id} joined room ${room_hash}`);
        io.emit('message:rooms', rooms);
    });

    socket.on('message:leave', (_) => {
        logger.info('Socket request: message:leave');
        // retrieve the room of the socket
        let room = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));

        if (!room) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        if (!rooms[room]) {
            logger.warn(`Could not find room ${room}`);
            return;
        }

        // remove the socket from the room
        rooms[room] = rooms[room].filter((player) => player !== socket.id);
        purgeEmptyRooms();
        io.emit('message:rooms', rooms);
    });

    socket.on('message:send', (message) => {
        logger.info('Socket request: message:send');
        // find the room of the sender
        let room = Object.keys(rooms).find((room) => rooms[room].includes(socket.id));

        if (!room) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        // Send a message to all players in the room
        rooms[room].forEach((player) => {
            io.to(player).emit('message:receive', message);
        });
    });

    socket.on('disconnect', () => {
        logger.info('Socket disconnected');
        // remove the socket from all rooms
        for (let room in rooms) {
            // check that the room exists and is an array
            if (rooms[room] && Array.isArray(rooms[room])) {
                rooms[room] = rooms[room].filter((player) => player !== socket.id);
            } else {
                delete rooms[room];
                logger.warn(`Room ${room} is not an array, purging`);
            }
        }
        purgeEmptyRooms();
        io.emit('message:rooms', rooms);
    });
}

module.exports = { registerHandlers };
