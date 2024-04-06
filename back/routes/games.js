let rooms = {};

function handleSocket(msg, socket, io) {
    switch (msg.action) {
        case 'join':
            if (!rooms[msg.room]) {
                rooms[msg.room] = [];
            } else {
                rooms[msg.room].push(socket.id);
            }

            // If room has 2 players, start game
            if (rooms[msg.room].length === 2) {
                io.to(rooms[msg.room][0]).emit('message', { type: 'query', message: 'placePlayer', params: [1] });
            }
            break;

        case 'list':
            // return all rooms with 1 player in it
            let roomsWithOnePlayer = Object.keys(rooms).filter((room) => rooms[room].length === 1);
            io.to(socket.id).emit('message', { type: 'rooms', rooms: roomsWithOnePlayer });
            break;

        case 'play':
            // check if room exists
            if (!rooms[msg.room]) {
                io.to(socket.id).emit('message', { type: 'error', message: 'Room does not exist' });
                return;
            }

            // check if room has 1 player
            if (rooms[msg.room].length !== 1) {
                io.to(socket.id).emit('message', { type: 'error', message: 'Room is full' });
                return;
            }

            // add player to room
            rooms[msg.room].push(socket.id);
            io.to(socket.id).emit('message', { type: 'info', message: 'Game started' });
            break;

        default:
            io.to(socket.id).emit('message', { type: 'error', message: 'Unknown message type' });
    }
}
