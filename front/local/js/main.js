import { Game, Player, getGame } from '../local/js/models.js';
import { init_board } from '../local/js/board.js';
import { addPlayers, display } from '../local/js/engine.js';
import { findPath, updatePath } from '../local/js/pathFinding.js';
import { updateFogOfWar } from '../local/js/fogwar.js';

export const LOG = false;

function onload() {
    if (LOG) console.log('Loaded');
    let board = new Game();

    let board_div = document.getElementById('board');
    init_board(board_div, board);
    if (LOG) console.log('Board initialized');

    addPlayers(board_div, board);
    if (LOG) console.log('Players initialized');
    updateFogOfWar(new Event('beginning'));

    board = getGame();
    updatePath(board.getCurrentPlayer());
}

document.addEventListener('DOMContentLoaded', onload);
