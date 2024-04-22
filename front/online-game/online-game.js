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
    console.log('game:setupAnswer');
    socket.emit('game:setupAnswer', { data: position });
}

socket.on('game:nextMove', (gamestate) => {
    console.log('game:nextMove ', gamestate);
    let game = getGame();
    game.setBoard(gamestate.board);
    game.setPlayerWalls('own', gamestate.ownWalls);
    game.setPlayerWalls('other', gamestate.opponentWalls);
    next_player();
});

export function nextMoveAnswer(position) {
    /*
     * position is a string representing the position of the player
     */
    console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', { data: position });
}

socket.on('game:endGame', (data) => {
    if (LOG) console.log('game:endGame', data);
    if (data !== 1 && data !== 2) {
        display_message('Match nul !', 'action_message', false);
        return;
    }
    if (data === getGame().getOnlinePlayer()) {
        display_message('Victoire !', 'action_message', false);
    } else {
        display_message('Défaite !', 'action_message', false);
    }
});

/* functional functions, to trigger socket on game events */
export function move(position) {
    /*
     * position is a string representing the position of the player
     */
    console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', {
        data: {
            action: 'move',
            value: position,
        },
    });
}

export function placeWall(position, vertical) {
    /*
     * wall is a list containing 2 elements:
     * - a position string representing the top-left square that the wall is in contact with
     * - an integer: 0 if the wall is placed horizontally or 1 if it is vertical
     */
    console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', {
        data: {
            action: 'wall',
            value: [position, vertical],
        },
    });
}
