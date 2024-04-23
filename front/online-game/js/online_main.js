import { Game } from './online_models.js';
import { addPlayers } from './online_engine.js';

export const LOG = false;

function onload() {
    if (LOG) console.log('Loaded');
    let board = new Game();

    let board_div = document.getElementById('board');

    addPlayers(board_div, board);
    if (LOG) console.log('Players initialized');
}

document.addEventListener('DOMContentLoaded', onload);
