const { Room } = require('../db/room');
const { logger } = require('../libs/logging');

const rooms = {};

function registerRoomHandlers(io, socket) {
    logger.debug('Registering room socket handlers');

    socket.on('room:login', (email) => {
        logger.info('Received room:login event with email:', email);
        rooms[email] = socket.id;
        io.emit('room:update');
    });

    socket.on('disconnect', () => {
        logger.info('Received disconnect event');
        delete rooms[Object.keys(rooms).find((key) => rooms[key] === socket.id)];
        io.emit('room:update');
    });

    socket.on('room:create', async (creator) => {
        logger.info('Received room:create event with creator:', creator);
        const roomId = Date.now().toString();
        const room = new Room(roomId, creator);

        try {
            await Room.create(room);
            logger.info(`Room created with ID: ${roomId} by ${creator}`);
            io.emit('room:created', room);
            socket.emit('room:list', await Room.getAvailableRooms());
        } catch (error) {
            logger.error(`Error creating room: ${error}`);
            socket.emit('error', 'Failed to create room');
        }
    });

    socket.on('room:join', async ({ roomId, joiner }) => {
        logger.info('Received room:join event with roomId:', roomId, 'and joiner:', joiner);
        const result = await Room.join(roomId, joiner);

        if (result.modifiedCount === 1) {
            logger.info(`${joiner} joined room ${roomId}`);
            io.emit('room:joined', { roomId, joiner });
            io.emit('room:list', await Room.getAvailableRooms());
        } else {
            socket.emit('error', 'Failed to join room');
        }
    });

    socket.on('room:list', async () => {
        logger.info('Received room:list event');
        const availableRooms = await Room.getAvailableRooms();
        socket.emit('room:list', availableRooms);
    });
    socket.on('room:delete', async (roomId) => {
        logger.info('Received room:delete event with roomId:', roomId);

        try {
            const result = await Room.delete(roomId);
            if (result.deletedCount === 1) {
                logger.info(`Room ${roomId} deleted successfully`);
                io.emit('room:deleted', roomId);
                io.emit('room:list', await Room.getAvailableRooms());
            } else {
                socket.emit('error', 'Failed to delete room');
            }
        } catch (error) {
            logger.error(`Error deleting room: ${error}`);
            socket.emit('error', 'Failed to delete room');
        }
    });
}

module.exports = { registerRoomHandlers };
