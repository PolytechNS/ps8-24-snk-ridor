import { Game } from "./models.js";
import { init_board } from "./board.js";
import { addPlayers, display } from "./engine.js";
import { findPath, updatePath } from "./pathFinding.js";
import { updateFogOfWar } from "./fogwar.js";

export const LOG = false;

function onload() {
    if (LOG) console.log("Loaded");
    let board = new Game();

    let board_div = document.getElementById("board");
    init_board(board_div, board);
    if (LOG) console.log("Board initialized");

    addPlayers(board_div, board);
    if (LOG) console.log("Players initialized");
    updateFogOfWar(new Event("beginning"));

    updatePath(board.p1_pos, board.p2_pos[0]);
}

document.addEventListener("DOMContentLoaded", onload);