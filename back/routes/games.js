const { logger } = require('../libs/logging');
const { startGame, setup1, setup2, nextMove1, nextMove2 } = require('../logic/engine');

games = {};

// games = {
//     'room_hash': {"game_object": game_object, "player1": player1, "player2": player2}
// }

function registerHandlers(io, socket) {
    logger.debug('Registering game socket handlers');

    socket.on('game:join', (room_hash) => {
        logger.info('Socket request: game:join');

        if (!room_hash) {
            logger.error('Room hash is empty');
            return;
        }

        games[room_hash] = games[room_hash] || {
            game_object: null,
            player1: null,
            player2: null,
            io: io,
        };

        // check if the socket is already in any room (player1 or player2)
        if (Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id)) {
            logger.warn(`Socket ${socket.id} is already in room ${room_hash}`);
            return;
        }

        if (games[room_hash].player1 && games[room_hash].player2) {
            logger.warn(`Room ${room_hash} is full`);
            return;
        }

        if (!games[room_hash].player1) {
            logger.debug(`${socket.id} joined room ${room_hash} as player1`);
            games[room_hash].player1 = socket.id;
        } else {
            logger.debug(`${socket.id} joined room ${room_hash} as player2`);
            games[room_hash].player2 = socket.id;
        }

        // if the room is full, start the game
        if (games[room_hash].player1 && games[room_hash].player2) {
            logger.debug(`Starting game in room ${room}`);
            startGame(room_hash, games[room_hash].game_object);
        }

        logger.info('Socket response: game:rooms');
        for (let room in games) {
            logger.info(`Room ${room} has players ${games[room].player1} and ${games[room].player2}`);
        }
        io.emit('game:rooms', getRoomsInfo());
    });

    socket.on('game:list', () => {
        logger.info('Socket request: game:list');
        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', getRoomsInfo());
    });

    socket.on('game:setupAnswer', (msg) => {
        logger.info('Socket request: game:setupAnswer');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;

        if (playerId === 1) {
            setup1(room_hash, msg, games[room_hash].game_object);
        } else {
            setup2(room_hash, msg, games[room_hash].game_object);
        }
    });

    socket.on('game:nextMoveAnswer', (msg) => {
        logger.info('Socket request: game:nextMoveAnswer');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;

        if (playerId === 1) {
            nextMove1(room_hash, msg, games[room_hash].game_object);
        } else {
            nextMove2(room_hash, msg, games[room_hash].game_object);
        }
    });
}

function getRoomsInfo() {
    for (let room in games) {
        logger.trace(`Room ${room} has players ${games[room].player1} and ${games[room].player2}`);
    }
    const roomsInfo = {};
    for (let room in games) {
        roomsInfo[room] = {
            player1: games[room].player1,
            player2: games[room].player2,
        };
    }
    for (let room in roomsInfo) {
        logger.trace(`Room ${room} has players ${roomsInfo[room].player1} and ${roomsInfo[room].player2}`);
    }
    return roomsInfo;
}

// Called Functions During Game That Triggers Function Calls in `engine.js`

function setup(playerId, room_hash, meta) {
    games[room_hash].game_object = meta;
    if (playerId === 1) {
        games[room_hash].io.to(games[room_hash].player1).emit('game:setup', 1);
    } else {
        games[room_hash].io.to(games[room_hash].player2).emit('game:setup', 2);
    }
}

function nextMove(playerId, room_hash, meta, gamestate) {
    games[room_hash].game_object = meta;
    if (playerId === 1) {
        games[room_hash].io.to(games[room_hash].player1).emit('game:nextMove', gamestate);
    } else {
        games[room_hash].io.to(games[room_hash].player2).emit('game:nextMove', gamestate);
    }
}

function endGame(losingPlayer, room_hash, meta) {
    games[room_hash].game_object = meta;
    games[room_hash].io.to(games[room_hash].player1).emit('game:endGame', losingPlayer);
    games[room_hash].io.to(games[room_hash].player2).emit('game:endGame', losingPlayer);
}

module.exports = {
    registerHandlers,
    setup,
    nextMove,
    endGame,
};
