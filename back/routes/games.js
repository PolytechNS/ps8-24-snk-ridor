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
            game_object: {},
            player1: null,
            player1ready: false,
            player2: null,
            player2ready: false,
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

        // if both players are present, send game:start to both
        if (games[room_hash].player1 && games[room_hash].player2) {
            logger.info(`Socket response: game:start`);
            io.to(games[room_hash].player1).emit('game:start', 1);
            logger.info(`Socket response: game:start`);
            io.to(games[room_hash].player2).emit('game:start', 2);
        }

        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', getRoomsInfo());
    });

    socket.on('game:list', () => {
        logger.info('Socket request: game:list');
        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', getRoomsInfo());
    });

    socket.on('game:ready', (oldSocketId) => {
        logger.info('Socket request: game:ready');

        if (!oldSocketId) {
            logger.warn('Old socket ID is empty, please provide the old socket ID');
            return;
        }

        let room_hash = Object.keys(games).find((room) => games[room].player1 === oldSocketId || games[room].player2 === oldSocketId);

        if (!room_hash) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        if (games[room_hash].player1 === oldSocketId) {
            games[room_hash].player1 = socket.id;
        }

        if (games[room_hash].player2 === oldSocketId) {
            games[room_hash].player2 = socket.id;
        }

        if (!room_hash) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        // If the room is not full, log
        if (!games[room_hash].player1 || !games[room_hash].player2) {
            logger.warn(`Room ${room_hash} is not full`);
            return;
        }

        if (games[room_hash].player1 === socket.id) {
            if (games[room_hash].player1ready) {
                logger.warn(`Player 1 is already ready in room ${room_hash}`);
                return;
            }
            games[room_hash].player1ready = true;
        }

        if (games[room_hash].player2 === socket.id) {
            if (games[room_hash].player2ready) {
                logger.warn(`Player 2 is already ready in room ${room_hash}`);
                return;
            }
            games[room_hash].player2ready = true;
        }

        // if both players are ready, start the game
        if (games[room_hash].player1ready && games[room_hash].player2ready) {
            logger.debug(`Starting game in room ${room_hash}`);
            startGame(room_hash, games[room_hash].game_object);
        }
    });

    socket.on('game:setupAnswer', (msg) => {
        logger.info('Socket request: game:setupAnswer');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;

        logger.trace(`Player ${playerId} setup answer in room ${room_hash}`);
        logger.trace(msg);

        if (playerId === 1) {
            if (games[room_hash].game_object['currentPlayer'] !== 1 || games[room_hash].game_object['currentPlayer'] === undefined) {
                logger.warn('Player 2 is not allowed to setup the board before player 1');
            }
            setup1(room_hash, msg, games[room_hash].game_object);
            games[room_hash].game_object['currentPlayer'] = 2;
        } else {
            if (games[room_hash].game_object['currentPlayer'] !== 2 || games[room_hash].game_object['currentPlayer'] === undefined) {
                logger.warn('Player 1 is not allowed to setup the board before player 2');
            }
            setup2(room_hash, msg, games[room_hash].game_object);
            games[room_hash].game_object['currentPlayer'] = 1;
        }
    });

    socket.on('game:nextMoveAnswer', (msg) => {
        logger.info('Socket request: game:nextMoveAnswer');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;

        if (playerId === 1) {
            if (games[room_hash].game_object['currentPlayer'] !== 1) {
                logger.warn('Player 2 is not allowed to make a move before player 1');
            }
            nextMove1(room_hash, msg, games[room_hash].game_object);
            games[room_hash].game_object['currentPlayer'] = 2;
        } else {
            if (games[room_hash].game_object['currentPlayer'] !== 2) {
                logger.warn('Player 1 is not allowed to make a move before player 2');
            }
            nextMove2(room_hash, msg, games[room_hash].game_object);
            games[room_hash].game_object['currentPlayer'] = 1;
        }
    });
}

function getRoomsInfo() {
    const roomsInfo = {};
    for (let room in games) {
        if (games[room].player1 && games[room].player2) {
            continue;
        }

        roomsInfo[room] = {
            player1: games[room].player1,
            player2: games[room].player2,
        };
    }
    return roomsInfo;
}

// Called Functions During Game That Triggers Function Calls in `engine.js`

function setup(playerId, room_hash, meta) {
    games[room_hash].game_object = meta;
    logger.trace(`Setting up game in room ${room_hash}, player ${playerId}`);
    if (playerId === 1) {
        logger.info(`Socket response: game:setup`);
        games[room_hash].io.to(games[room_hash].player1).emit('game:setup', 1);
    } else {
        logger.info(`Socket response: game:setup`);
        games[room_hash].io.to(games[room_hash].player2).emit('game:setup', 2);
    }
}

function nextMove(playerId, room_hash, meta, gamestate, opponentGamestate) {
    games[room_hash].game_object = meta;
    logger.info(`Socket response: game:nextMove`);
    if (playerId === 1) {
        games[room_hash].io.to(games[room_hash].player1).emit('game:nextMove', gamestate);
        games[room_hash].io.to(games[room_hash].player2).emit('game:updateBoard', opponentGamestate);
    } else {
        games[room_hash].io.to(games[room_hash].player2).emit('game:nextMove', gamestate);
        games[room_hash].io.to(games[room_hash].player1).emit('game:updateBoard', opponentGamestate);
    }
    logger.info(`Socket response: game:updatedBoard`);
}

function endGame(losingPlayer, room_hash, meta) {
    games[room_hash].game_object = meta;
    logger.info(`Socket response: game:endGame`);
    games[room_hash].io.to(games[room_hash].player1).emit('game:endGame', losingPlayer);
    logger.info(`Socket response: game:endGame`);
    games[room_hash].io.to(games[room_hash].player2).emit('game:endGame', losingPlayer);
}

module.exports = {
    registerHandlers,
    setup,
    nextMove,
    endGame,
};
