import { Game, getGame } from './local_models.js';
import { init_board } from './local_board.js';
import { addPlayers } from './local_engine.js';
import { updatePath } from './local_pathFinding.js';
import { updateFogOfWar } from './local_fogwar.js';

export const LOG = true;

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
