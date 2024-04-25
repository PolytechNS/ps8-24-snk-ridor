import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { getGame } from './js/online_models.js';
import { LOG } from './js/online_main.js';
import { init_board, display_message } from './js/online_board.js';
import { next_player } from './js/online_engine.js';
import { displayEndGame } from './js/online_display.js';

var socket;
var sound_move = new Audio('/resources/sounds/move.mp3');
var sound_wall = new Audio('/resources/sounds/wall.mp3');
var sound_jump = new Audio('/resources/sounds/jump.mp3');
var sound_win = new Audio('/resources/sounds/win.mp3');
var sound_lose = new Audio('/resources/sounds/lose.mp3');
var sound_dring = new Audio('/resources/sounds/dring.mp3');

document.addEventListener('DOMContentLoaded', function () {
    if (LOG) console.log('arrived in online-game.js');

    // add event to return button
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace('/home');
    });

    socket = io();

    // retrieve socket id
    var old_socket_id = localStorage.getItem('socket_id');

    socket.on('connect', () => {
        socket.emit('game:ready', old_socket_id);
    });

    socket.on('game:setup', (playerId) => {
        if (LOG) console.log('game:setup ', playerId);
        getGame().setOnlinePlayer(playerId);
        init_board();
        if (LOG) console.log(`The current player is player ${playerId}`);
        display_message('Place ton pion', 'action_message', false);
    });

    socket.on('game:nextMove', (gamestate) => {
        if (LOG) console.log('game:nextMove ', gamestate);
        let game = getGame();
        game.setBoard(gamestate.board);
        game.setPlayerWalls('own', gamestate.ownWalls);
        game.setPlayerWalls('other', gamestate.opponentWalls);
        next_player();
    });

    socket.on('game:updateBoard', (gamestate) => {
        /*
         * gamestate is a dictionary containing:
         * - a board list
         * - a list of walls for the player
         * - a list of walls for the opponent
         *
         * this function is called after the end of the turn to update the board
         */
        if (LOG) console.log('game:updateBoard ', gamestate);

        let game = getGame();
        game.setPlayerWalls('own', gamestate.ownWalls);
        game.setPlayerWalls('other', gamestate.opponentWalls);
        game.setBoard(gamestate.board);
    });

    // quand on reçoit un message de fin de partie
    socket.on('game:endGame', (data) => {
        if (LOG) console.log('game:endGame', data);
        let game = getGame();
        if (getGame().getTurnCount() > 0) {
            displayEndGame();
        }
        if (data !== 1 && data !== 2) {
            display_message('Match nul !', 'action_message', false);
            sound_lose.play();
        } else if (data === game.getOnlinePlayer()) {
            display_message('Perdu !', 'action_message', false);
            sound_lose.play();
        } else {
            display_message('Victoire !', 'action_message', false);
            sound_win.play();
        }
    });

    // Log any error that occurs
    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });

    // on timeout
    socket.on('game:timeout', (time) => {
        display_message(`⏰ Plus que ${time} secondes !`, 'info_message');
        sound_dring.play();
    });
});

export function setupAnswer(position) {
    /*
     * position is a string representing the position of the player
     */
    if (LOG) console.log('game:setupAnswer');
    socket.emit('game:setupAnswer', { data: position });
}

export function nextMoveAnswer(position) {
    /*
     * position is a string representing the position of the player
     * or a list containing 2 elements:
     * - a position string representing the top-left square that the wall is in contact with
     * - an integer: 0 if the wall is placed horizontally or 1 if it is vertical
     */
    if (LOG) console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', { data: position });
}

/* functional functions, to trigger socket on game events */
export function move(position, jump = false) {
    /*
     * position is a string representing the position of the player
     */
    if (LOG) console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', {
        data: {
            action: 'move',
            value: position,
        },
    });
    if (jump) {
        sound_jump.play();
    } else {
        sound_move.play();
    }
}

export function placeWall(position, vertical) {
    /*
     * wall is a list containing 2 elements:
     * - a position string representing the top-left square that the wall is in contact with
     * - an integer: 0 if the wall is placed horizontally or 1 if it is vertical
     */
    if (LOG) console.log('game:nextMoveAnswer');
    socket.emit('game:nextMoveAnswer', {
        data: {
            action: 'wall',
            value: [position, vertical],
        },
    });
    sound_wall.play();
}
