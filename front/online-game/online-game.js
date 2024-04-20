import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { getGame } from './js/online_models.js';
import { LOG } from './js/online_main.js';
import { display_message } from './js/online_board.js';
import { next_player } from './js/online_engine.js';

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
            display_message('Place ton pion', 'action_message', false);
        } else {
            getGame().setOnlinePlayer(2);
            if (LOG) console.log('The current player is player 2');
            display_message('Place ton pion', 'action_message', false);
        }
    });
});

export function setupAnswer(position) {
    /*
     * position is a string representing the position of the player
     */
    console.log('setupAnswer');
    socket.emit('game:setupAnswer', { data: position });
}

socket.on('game:nextMove', (data) => {
    console.log('game:nextMove ', data);
    next_player();
});

export function nextMoveAnswer(position) {
    /*
     * position is a string representing the position of the player
     */
    console.log('nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', { data: position });
    next_player();
}

socket.on('game:endGame', (data) => {
    console.log('game:endGame', data);
});
