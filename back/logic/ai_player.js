// import socket.io
const io = require('socket.io-client');

function joinAI(room_hash) {
    const socket = io.connect('http://localhost:8000', { reconnect: true });

    socket.on('connect', () => {
        socket.emit('game:join', room_hash);
    });

    socket.on('game:start', (player) => {
        socket.emit('game:ready', socket.id);
    });

    socket.on('game:setup', (data) => {
        // start timeout
        setTimeout(() => {
            socket.emit('game:setupAnswer', { data: '99' });
        }, 1000);
    });

    socket.on('game:nextMove', (data) => {
        setTimeout(() => {
            socket.emit('game:nextMoveAnswer', { data: '99' });
        }, 1000);
    });
}

module.exports = { joinAI };
