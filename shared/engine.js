// engine of quoridor with the new coordinate system
// 1, 1 is the bottom lext corner, 9, 9 is the top right corner
// a wall have for coordinates the top left cell coords and the orientation (0 for horizontal, 1 for vertical)

import { Board } from './board.js';
import { display_board, display_initial_board, display_action_message } from '../js/display.js';

export class Engine {
    constructor() {
        this.board = new Board();
    }

    newGame(player1, player2, local1v1) {
        if (local1v1 === void 0) {
            local1v1 = false;
        }
        this.board = new Board(local1v1);
        display_board(this.board);
    }

    initPlayer(player, x, y) {
        this.board.placePlayer(player, x, y);
        display_board(this.board);
    }

    movePlayer(player, x, y) {
        this.board.movePlayer(player, x, y);
        display_board(this.board);
    }

    placeWall(player, x, y, orientation) {
        this.board.placeWall(player, x, y, orientation);
        display_board(this.board);
    }
}

// Initialisation
// Quand le joueur démarre la partie il lui est attribué un tour (1 ou 2)
// Il lui est attribué 10 murs
// Il peut placer un pion sur la ligne 1 ou 9 (selon son tour)
export function newGame(player1, player2, local1v1) {
    if (local1v1 === void 0) {
        local1v1 = false;
    }
    let board = new Board(local1v1);
    display_initial_board(1, board);
    console.log('Nouvelle partie');
    display_action_message('Place un joueur sur la ligne 1');
}

export function initPlayer(board, player, x, y) {
    board.placePlayer(player, x, y);
    display_board(board);
}

export function movePlayer(board, player, x, y) {
    board.movePlayer(player, x, y);
    (0, display_1.display_board)(board);
}

export function placeWall(board, player, x, y, orientation) {
    board.placeWall(player, x, y, orientation);
    display_board(board);
}

/* HTML events */
export function onCellClick(event) {
    let cell = event.target;
    let coords = cell.id
        .split('-')
        .slice(1)
        .map((x) => parseInt(x));
    movePlayer(1, coords[0], coords[1]);
}

export function onWallClick(event) {
    let wall = event.target;
    let coords = wall.id
        .split('-')
        .slice(2)
        .map((x) => parseInt(x));
    placeWall(board, 1, coords[0], coords[1], wall.classList.contains('v-wall') ? 1 : 0);
}

export function onWallOver(event) {
    let wall = event.target;
    wall.classList.add('hover');
}

export function onWallOut(event) {
    let wall = event.target;
    wall.classList.remove('hover');
}

export function onBoardInit() {
    newGame();
}
