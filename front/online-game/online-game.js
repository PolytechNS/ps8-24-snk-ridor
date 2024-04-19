import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('arrived in online-game.js');

    const socket = io();

    socket.on('connect', () => {
        socket.emit('game:ready');
    });

    socket.on('game:setup', (playerId) => {
        console.log('game:setup ', playerId);
        if (playerId === 1) {
            document.getElementById('self_pseudo').style.color = 'red';
            document.getElementById('other_pseudo').style.color = 'black';
        } else {
            document.getElementById('self_pseudo').style.color = 'black';
            document.getElementById('other_pseudo').style.color = 'red';
        }
    });
});
