const { logger } = require('../libs/logging');
const { startGame, setup1, setup2, nextMove1, nextMove2 } = require('../logic/engine');
const { joinAI } = require('../logic/ai_player');
const { updateElo } = require('../logic/elo');
const { User } = require('../db/user');

const TIME_LIMIT_S = 60; // 1 minute

games = {};

function registerHandlers(io, socket) {
    logger.debug('Registering game socket handlers');

    // on disconnect make player lose
    socket.on('disconnect', () => {
        logger.info('Socket disconnected');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        if (!room_hash) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;
        logger.warn(`Player ${playerId} disconnected`);
        if (games[room_hash].status === 'running' && games[room_hash].player1ready && games[room_hash].player2ready) {
            endGame(playerId, room_hash, games[room_hash].game_object);
        }
    });

    socket.on('game:join', (room_hash) => {
        logger.info('Socket request: game:join');

        if (!room_hash) {
            logger.error('Room hash is empty');
            return;
        }

        games[room_hash] = games[room_hash] || {
            game_object: {},
            player1: null,
            player1email: null,
            player1ready: false,
            player2: null,
            player2email: null,
            player2ready: false,
            io: io,
            timeout: null,
            w_timeout: null,
            status: 'pending',
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

    socket.on('game:login', (email) => {
        logger.info('Socket request: game:login');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        if (!room_hash) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        if (games[room_hash].player1 === socket.id) {
            games[room_hash].player1email = email;
        }

        if (games[room_hash].player2 === socket.id) {
            games[room_hash].player2email = email;
        }

        logger.info('Socket response: game:rooms');
        io.emit('game:rooms', getRoomsInfo());
        logger.info('Socket response: game:info');
        if (games[room_hash].player1email && games[room_hash].player2email) {
            User.getByName(games[room_hash].player1email).then((user) => {
                io.to(games[room_hash].player2).emit('game:info', { opponentName: user.name, opponentElo: user.elo });
            });
            User.getByName(games[room_hash].player2email).then((user) => {
                io.to(games[room_hash].player1).emit('game:info', { opponentName: user.name, opponentElo: user.elo });
            });
            logger.info('Socket response: game:info');
        }
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

            startTimer(1, room_hash);
            startGame(room_hash, games[room_hash].game_object);
        }
    });

    socket.on('game:setupAnswer', (msg) => {
        logger.info('Socket request: game:setupAnswer');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id || games[room].player2 === socket.id);
        let playerId = games[room_hash].player1 === socket.id ? 1 : 2;

        logger.trace(`Player ${playerId} setup answer in room ${room_hash}`);
        logger.trace(JSON.stringify(msg));

        if (playerId === 1) {
            if (games[room_hash].game_object['currentPlayer'] === 2) {
                logger.warn('Player 2 is not allowed to setup the board before player 1');
                return;
            }

            startTimer(1, room_hash);
            setup1(room_hash, msg, games[room_hash].game_object);
            logger.trace("Player 2's turn");
            games[room_hash].game_object['currentPlayer'] = 2;
        } else {
            if (games[room_hash].game_object['currentPlayer'] === 1 || games[room_hash].game_object['currentPlayer'] === undefined) {
                logger.warn('Player 1 is not allowed to setup the board before player 2');
                return;
            }

            startTimer(1, room_hash);
            setup2(room_hash, msg, games[room_hash].game_object);
            logger.trace("Player 1's turn");
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
                return;
            }

            startTimer(2, room_hash);
            nextMove1(room_hash, msg, games[room_hash].game_object);
            logger.trace("Player 2's turn");
            games[room_hash].game_object['currentPlayer'] = 2;
        } else {
            if (games[room_hash].game_object['currentPlayer'] !== 2) {
                logger.warn('Player 1 is not allowed to make a move before player 2');
                return;
            }

            startTimer(1, room_hash);
            nextMove2(room_hash, msg, games[room_hash].game_object);
            logger.trace("Player 1's turn");
            games[room_hash].game_object['currentPlayer'] = 1;
        }
    });

    socket.on('game:ai', () => {
        logger.info('Socket request: game:ai');
        let room_hash = Object.keys(games).find((room) => games[room].player1 === socket.id);

        if (!room_hash) {
            logger.warn(`Could not find room for socket ${socket.id}`);
            return;
        }

        if (games[room_hash].player2) {
            logger.warn(`Room ${room_hash} is full`);
            return;
        }

        joinAI(room_hash);
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

function nextMove(playerId, room_hash, meta, gameState, opponentGameState) {
    games[room_hash].game_object = meta;
    logger.info(`Socket response: game:nextMove`);
    if (playerId === 1) {
        games[room_hash].io.to(games[room_hash].player1).emit('game:nextMove', gameState);
        games[room_hash].io.to(games[room_hash].player2).emit('game:updateBoard', opponentGameState);
    } else {
        games[room_hash].io.to(games[room_hash].player2).emit('game:nextMove', gameState);
        games[room_hash].io.to(games[room_hash].player1).emit('game:updateBoard', opponentGameState);
    }
    logger.info(`Socket response: game:updatedBoard`);
}

function endGame(losingPlayer, room_hash, meta) {
    logger.trace(`Ending game in room ${room_hash}`);
    clearTimer(room_hash);
    games[room_hash].status = 'ended';
    games[room_hash].game_object = meta;
    logger.info(`Socket response: game:endGame`);
    games[room_hash].io.to(games[room_hash].player1).emit('game:endGame', losingPlayer);
    logger.info(`Socket response: game:endGame`);
    games[room_hash].io.to(games[room_hash].player2).emit('game:endGame', losingPlayer);

    Promise.all([User.getByName(games[room_hash].player1email), User.getByName(games[room_hash].player2email)])
        .then(([player1, player2]) => {
            const realPlayer1Email = player1.email;
            const realPlayer2Email = player2.email;

            logger.debug(`Updating elo for ${realPlayer1Email} and ${realPlayer2Email}`);

            if (realPlayer1Email && realPlayer2Email) {
                updateElo(realPlayer1Email, realPlayer2Email, losingPlayer);
            }
        })
        .catch((err) => {
            logger.error('Error retrieving player emails:', err);
        });
}

function startTimer(player, room_hash) {
    if (games[room_hash].timeout) {
        logger.debug('Clearing previous timeout');
        clearTimeout(games[room_hash].timeout);
        clearTimeout(games[room_hash].w_timeout);
    }

    logger.debug(`Starting timer for player ${player} of ${TIME_LIMIT_S} seconds`);
    games[room_hash].timeout = setTimeout(() => {
        logger.warn(`Player ${player} took too long to make a move`);
        endGame(player, room_hash, games[room_hash].game_object);
    }, TIME_LIMIT_S * 1000);

    logger.debug(`Starting warning timer for player ${player} of ${TIME_LIMIT_S - 10} seconds`);
    games[room_hash].w_timeout = setTimeout(
        () => {
            logger.warn(`Player ${player} has 10 seconds left to make a move`);
            if (player === 1) {
                games[room_hash].io.to(games[room_hash].player1).emit('game:timeout', 10);
            } else {
                games[room_hash].io.to(games[room_hash].player2).emit('game:timeout', 10);
            }
        },
        (TIME_LIMIT_S - 10) * 1000
    );
}

function clearTimer(room_hash) {
    if (games[room_hash].timeout) {
        logger.debug('Clearing timeout');
        clearTimeout(games[room_hash].timeout);
        clearTimeout(games[room_hash].w_timeout);
    }
}

module.exports = {
    registerHandlers,
    setup,
    nextMove,
    endGame,
};
