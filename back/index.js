const http = require('http');
const { Server } = require('socket.io');

const { logger } = require('./libs/logging');

// routes
const api = require('./routes/api.js');
const front = require('./routes/front/front.js');
const roomChat = require('./routes/room_chat');
const friendChat = require('./routes/friend_chat');
const games = require('./routes/games');
const room = require('./routes/room');
const { notFoundHandler } = require('./routes/errors');
const PORT = process.env.PORT || 8000;

const server = http.createServer(function (request, response) {
    let filePath = request.url.split('/').filter(function (elem) {
        return elem !== '..';
    });

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Credentials', 'true');

    try {
        if (filePath[1] === 'api') {
            logger.info(`API request: ${request.url}`);
            api.manageRequest(request, response);
        } else {
            logger.info(`Front request: ${request.url}`);
            front.manageRequest(request, response);
        }
    } catch (error) {
        console.log(`error while processing ${request.url}: ${error}`);
        notFoundHandler(request, response);
    }
});

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    logger.info('Socket connected');
    roomChat.registerHandlers(io, socket);
    friendChat.registerHandlers(io, socket);
    games.registerHandlers(io, socket);
    room.registerRoomHandlers(io, socket);
});

io.on('disconnect', () => {
    logger.info('Socket disconnected');
});

server.listen(PORT);

logger.info(`Server running at http://localhost:${PORT}/`);

module.exports = { server, io };
