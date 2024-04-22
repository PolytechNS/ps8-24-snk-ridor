import { Game, getGame } from './online_models.js';
import { init_board } from './online_board.js';
import { addPlayers } from './online_engine.js';
import { updatePath } from './online_pathFinding.js';
import { updateFogOfWar } from './online_fogwar.js';

export const LOG = false;

function onload() {
    if (LOG) console.log('Loaded');
    let board = new Game();

    let board_div = document.getElementById('board');
    init_board(board_div, board);
    if (LOG) console.log('Board initialized');

    addPlayers(board_div, board);
    if (LOG) console.log('Players initialized');
}

document.addEventListener('DOMContentLoaded', onload);