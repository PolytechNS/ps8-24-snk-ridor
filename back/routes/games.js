const { logger } = require('../libs/logging');
const { startGame, setup1, setup2, nextMove1, nextMove2 } = require('../logic/engine');

rooms = {};

// rooms = {
//     'room_hash': {"game_object": game_object, "player1": player1, "player2": player2}
// }

function registerHandlers(io, socket) {
    logger.debug('Registering game socket handlers');

    socket.on('game:join', (room_hash) => {
        logger.info('Socket request: game:join');

        rooms[room_hash] = rooms[room_hash] || {
            game_object: null,
            player1: null,
            player2: null,
            io: io,
        };

        // check if the socket is already in any room (player1 or player2)
        if (Object.keys(rooms).find((room) => rooms[room].player1 === socket.id || rooms[room].player2 === socket.id)) {
            logger.warn(`Socket ${socket.id} is already in room ${room_hash}`);
            return;
        }

        if (rooms[room_hash].player1 && rooms[room_hash].player2) {
            logger.warn(`Room ${room_hash} is full`);
            return;
        }

        if (!rooms[room_hash].player1) {
            logger.debug(`${socket.id} joined room ${room_hash} as player1`);
            rooms[room_hash].player1 = socket.id;
        } else {
            logger.debug(`${socket.id} joined room ${room_hash} as player2`);
            rooms[room_hash].player2 = socket.id;
        }

        // if the room is full, start the game
        if (rooms[room_hash].player1 && rooms[room_hash].player2) {
            logger.debug(`Starting game in room ${room}`);
            startGame(room_hash, rooms[room_hash].game_object);
        }

        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', rooms);
    });

    socket.on('game:list', () => {
        logger.info('Socket request: game:rooms');
        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', rooms);
    });

    socket.on('game:setupAnswer', (msg) => {
        logger.info('Socket request: game:setupAnswer');
        let room_hash = Object.keys(rooms).find((room) => rooms[room].player1 === socket.id || rooms[room].player2 === socket.id);
        let playerId = rooms[room_hash].player1 === socket.id ? 1 : 2;

        if (playerId === 1) {
            setup1(room_hash, msg, rooms[room_hash].game_object);
        } else {
            setup2(room_hash, msg, rooms[room_hash].game_object);
        }
    });

    socket.on('game:nextMoveAnswer', (msg) => {
        logger.info('Socket request: game:nextMoveAnswer');
        let room_hash = Object.keys(rooms).find((room) => rooms[room].player1 === socket.id || rooms[room].player2 === socket.id);
        let playerId = rooms[room_hash].player1 === socket.id ? 1 : 2;

        if (playerId === 1) {
            nextMove1(room_hash, msg, rooms[room_hash].game_object);
        } else {
            nextMove2(room_hash, msg, rooms[room_hash].game_object);
        }
    });
}

// Called Functions During Game That Triggers Function Calls in `engine.js`

function setup(playerId, room_hash, meta) {
    rooms[room_hash].game_object = meta;
    if (playerId === 1) {
        rooms[room_hash].io.to(rooms[room_hash].player1).emit('game:setup', 1);
    } else {
        rooms[room_hash].io.to(rooms[room_hash].player2).emit('game:setup', 2);
    }
}

function nextMove(playerId, room_hash, meta, gamestate) {
    rooms[room_hash].game_object = meta;
    if (playerId === 1) {
        rooms[room_hash].io.to(rooms[room_hash].player1).emit('game:nextMove', gamestate);
    } else {
        rooms[room_hash].io.to(rooms[room_hash].player2).emit('game:nextMove', gamestate);
    }
}

function endGame(losingPlayer, room_hash, meta) {
    rooms[room_hash].game_object = meta;
    rooms[room_hash].io.to(rooms[room_hash].player1).emit('game:endGame', losingPlayer);
    rooms[room_hash].io.to(rooms[room_hash].player2).emit('game:endGame', losingPlayer);
}

module.exports = {
    registerHandlers,
    setup,
    nextMove,
    endGame,
};
