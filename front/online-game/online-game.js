import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { getGame } from './js/online_models.js';
import { LOG } from './js/online_main.js';

const socket = io();

document.addEventListener('DOMContentLoaded', function () {
    console.log('arrived in online-game.js');

    // retrieve socket id
    const old_socket_id = localStorage.getItem('socket_id');

    socket.on('connect', () => {
        socket.emit('game:ready', old_socket_id);
    });

    socket.on('game:setup', (playerId) => {
        console.log('game:setup ', playerId);
        if (playerId === 1) {
            getGame().setOnlinePlayer(1);
            if (LOG) console.log('The current player is player 1');
        } else {
            getGame().setOnlinePlayer(2);
            if (LOG) console.log('The current player is player 2');
        }
    });
});

export function placePlayer() {
    console.log('placePlayer');
    socket.emit('game:placePlayer');
}
