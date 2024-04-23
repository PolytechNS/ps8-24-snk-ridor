// import socket.io
const io = require('socket.io-client');

function joinAI(room_hash) {
    const socket = io.connect('http://localhost:8000', { reconnect: true });

    socket.on('connect', () => {
        socket.emit('game:ready', socket.id);
    });
}

module.exports = { joinAI };
