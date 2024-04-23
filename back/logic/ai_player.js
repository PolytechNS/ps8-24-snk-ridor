// import socket.io
const io = require('socket.io-client');

function joinAI(room_hash) {
    const socket = io.connect('http://localhost:8000', { reconnect: true });

    socket.on('connect', () => {
        socket.emit('game:join', room_hash);
        socket.emit('game:ready', socket.id);
    });

    socket.on('game:setup', (data) => {
        if (data.player === 2) {
            socket.emit('game:setupA', { x: 0, y: 0 });
        }
    });
}

module.exports = { joinAI };
