/* engine for the game Corridor */

/*
the game is determined by the following rules :

Fog of war :
- The game can only be played with 2 players, 1 versus 1.
- The game is played on a 9x9 board.
- At the beginning of the game, each cell on the 4 first lines have a visibility of +1, the ones on the fifth line have a visibility of 0, and the 4 last lines have a visibility of -1.

Players :
- Player A starts on any column of line 1 ; Player B starts on any column of line 9.
- During the game, the cell the player A is on, and the 4 adjacent cells, have a +1 visibility ; the cell the player B is on, and the 4 adjacent cells, have a -1 visibility.

Walls :
- Walls are 2 cells long and can be placed between cells ; each players starts with 10 Walls.
- Each cell in contact with a Wall placed by player A gets +2 visibility; Each cell that is 1 cell away from a Wall placed by player A gets +1 visibility.
- Each cell in contact with a Wall placed by player B gets -2 visibility; Each cell that is 1 cell away from a Wall placed by player B gets —1 visibility.
- The visibility modifiers are cumulative.

Visibility :
- Player A can only see cell it's on, and the cells that have a visibility score of at least 0 ; Player B can only see cell it's on, and the cells that have a visibility score of at most 0.
- A player can see the other player if it is 1 cell away or if it is on a visibility cell.
- PLayers don't know the visibility value of a cell ; they just know if they can see it.
- Players can't see the walls.

Goal :
- The goal for Player A is to reach the line 9 ; Player B have to reach line 1.
- Player A plays first.
- If Player A reaches line 9 first, Player B has one move to try and reach line 1. If player B succeeds, the game ends in a draw ; otherwise, Player A wins.
- If Player B reaches line 1 first, the game ends with Player B victory.
- When it's a player turn, the options are :
    - Placing a wall somewhere it doesn't make it impossible for any player to reach the end,
    - Moving 1 cell in a caridnal direction. Notes :
        - Players can't jump over walls
        - Players can jump over other players
    - Players cannot skip their turn unless they have no action available.
- After 100 turns from both players (200 in total), the game ends in a draw.

*/

import { BOARD_HEIGHT, BOARD_WIDTH, getGame, Event, Player } from "./models.js";
import { LOG } from "./main.js";
import { updateFogOfWar } from "./fogwar.js";
import { updatePath } from "./pathFinding.js";

const LINES = BOARD_HEIGHT;
const COLUMNS = BOARD_WIDTH;
const WALLS = 10;
const WALL_LENGTH = 2;

const PLAYER_A = 1;
const PLAYER_B = 2;

const PLAYER_A_COLOR = 'red';
const PLAYER_B_COLOR = 'blue';

const PLAYER_A_START_LINE = LINES - 1;
const PLAYER_B_START_LINE = 0;

let board_data = [];
let board_visibility = [];

let player_a;
let player_b;

let turn = 0;

function main() {
    initialise_game();
    display();
    addPlayers();
}

function initialise_game() {
    for (let i = 0; i < LINES; i++) {
        board_data.push([]);
        board_visibility.push([]);
        for (let j = 0; j < COLUMNS; j++) {
            board_data[i].push(0);
            if (i < 4) {
                board_visibility[i].push(1);
            } else if (i > 4) {
                board_visibility[i].push(-1);
            } else {
                board_visibility[i].push(0);
            }
        }
    }
    updateFogOfWar("beginning", null);
}

export function next_player(event = null) {
    if (LOG) console.log(`next_player() called`);
    updateFogOfWar(event);
    //updatePath(getGame()['p' + getPlayerTurn().player + '_pos'], LINES - 1);
    updatePath(getGame()['p1_pos'], 0);
    deleteOverview();
    turn++;
    document.getElementById('turn').textContent = turn+1;
    getGame().current_player = turn % 2 + 1;
    document.getElementById('player').textContent = ["","A","B"][getPlayerTurn().player];
}

export function getCorridorPossiblePosition(line, column) {
    let cells = [];
    if (line > 0) {
        if (!document.getElementById('h-wall-' + (line - 1) + '-' + column).classList.contains("placed")) {
            if (document.getElementById('cell-' + (line - 1) + '-' + column).childElementCount == 0) {
                cells.push([line - 1, column]);
            } else {
                if (line > 1 && !document.getElementById('h-wall-' + (line - 2) + '-' + column).classList.contains("placed")) { 
                    cells.push([line - 2, column]);
                }
            }
        }
    }
    if (line < LINES - 1) {
        if (!document.getElementById('h-wall-' + line + '-' + column).classList.contains("placed")) {
            if (document.getElementById('cell-' + (line + 1) + '-' + column).childElementCount == 0) {
                cells.push([line + 1, column]);
            } else {
                if (line < LINES - 2 && !document.getElementById('h-wall-' + (line + 1) + '-' + column).classList.contains("placed")) {
                    cells.push([line + 2, column]);
                }
            }
        }
    }
    if (column > 0) {
        if (!document.getElementById('v-wall-' + line + '-' + (column - 1)).classList.contains("placed")) {
            if (document.getElementById('cell-' + line + '-' + (column - 1)).childElementCount == 0) {
                cells.push([line, column - 1]);
            } else {
                if (column > 1 && !document.getElementById('v-wall-' + line + '-' + (column - 2)).classList.contains("placed")) {
                    cells.push([line, column - 2]);
                }
            }
        }
    }
    if (column < COLUMNS - 1) {
        if (!document.getElementById('v-wall-' + line + '-' + column).classList.contains("placed")) {
            if (document.getElementById('cell-' + line + '-' + (column + 1)).childElementCount == 0) {
                cells.push([line, column + 1]);
            } else {
                if (column < COLUMNS - 2 && !document.getElementById('v-wall-' + line + '-' + (column + 1)).classList.contains("placed")) {
                    cells.push([line, column + 2]);
                }
            }
        }
    }
    return cells;
}

function checkVictory(player) {
    if (LOG) console.log(`checkVictory(${player}) called`);
    if (player == player_b && player.line == PLAYER_A_START_LINE) {
        updateFogOfWar(new Event("end", player.player, [player.line, player.column]));
        alert('Player B won'); // TODO : change this to a better way to display the victory
        return true;
    } else if (player == player_a && player.line == PLAYER_B_START_LINE) {
        updateFogOfWar(new Event("end", player.player, [player.line, player.column]));
        alert('Player A won'); // TODO : change this to a better way to display the victory
        return true;
    }
    return false;
}

function move_player(player, line, column) {
    if (LOG) console.log(`move_player(${player}, ${line}, ${column}) called`);
    let old_line = player.line;
    let old_column = player.column;

    player.line = line;
    player.column = column;

    let cell = document.getElementById('cell-' + old_line + '-' + old_column);
    cell.removeChild(player);
    cell = document.getElementById('cell-' + line + '-' + column);
    cell.appendChild(player);
    getGame()['p' + player.player + '_pos'] = [line, column];

    if (checkVictory(player)) {
        updateFogOfWar(new Event("end", player.player, [player.line, player.column]));
        deleteOverview();
        return;
    }
    let event = new Event("move", player.player, [old_line, old_column], [line, column]);
    next_player(event);
}

export function display() {
    if (LOG) console.log(`display() called`);
    let board = document.getElementById('board');
    board.innerHTML = '';

    board.style.gridTemplateColumns = `repeat(${COLUMNS * 2 - 1}, min-content)`
    board.style.gridTemplateRows = `repeat(${LINES * 2 - 1}, min-content)`

    for (let i = 0; i < LINES; i++) {
        for (let j = 0; j < COLUMNS; j++) {
            // Create cell
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + i + '-' + j;
            cell.addEventListener('click', onCellClick);
            if (LOG) cell.textContent = `[${i}, ${j}]`;
            board.appendChild(cell);

            // Create vertical wall
            if (j < COLUMNS - 1) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + i + '-' + j;
                wall.addEventListener('mouseover', onWallOver);
                wall.addEventListener('mouseout', onWallOut);
                wall.addEventListener('click', onWallClick);
                board.appendChild(wall);
            }
        }

        // Create horizontal wall
        for (let j = 0; j < COLUMNS; j++) {
            if (i < LINES - 1) {

                // Create horizontal wall
                let wall = document.createElement('div');
                wall.classList.add('wall', 'h-wall');
                wall.id = 'h-wall-' + i + '-' + j;
                wall.addEventListener('mouseover', onWallOver);
                wall.addEventListener('mouseout', onWallOut);
                wall.addEventListener('click', onWallClick);
                board.appendChild(wall);

                // Create horizontal wall-s
                if (j < COLUMNS - 1) {
                    let wall_s = document.createElement('div');
                    wall_s.classList.add('s-wall', 'wall');
                    wall_s.id = 's-wall-' + i + '-' + j;
                    board.appendChild(wall_s);
                }
            }
        }
    }
}

function isPlayerTurn(player) {
    if (LOG) console.log(`isPlayerTurn(${player}) called`);
    let retour = turn % 2 == player-1;
    if (LOG) console.log(`isPlayerTurn(${player}) returns ${retour}`);
    return retour;
}

function getPlayerTurn() {
    if (LOG) console.log(`getPlayerTurn() called`);
    let retour = [player_a, player_b][turn % 2];
    if (LOG) console.log(`getPlayerTurn() returns ${retour}`);
    return retour;
}

function deleteOverview() {
    if (LOG) console.log(`deleteOverview() called`);
    let overviewes = document.querySelectorAll('.position_overview');
    overviewes.forEach(element => {
        element.parentElement.overviewed = false;
        element.remove();
    });
}

export function onCellClick(event) {
    if (LOG) console.log(`onCellClick(${event}) called`);
    let cell = event.target;
    let id = cell.id.split('-');
    let line = parseInt(id[1]);
    let column = parseInt(id[2]);
    
    if (event.target.className == 'position_overview') {
        cell = event.target.parentElement;
    } else {
        cell = event.target;
    }

    // if cell contains a player
    if (cell.contains(player_a) || cell.contains(player_b)) {
        return;
    }

    if (cell.selected) {
        cell.selected = false;
    }
    if (cell.overviewed) {
        move_player(getPlayerTurn(), line, column);
    } else {
        deleteOverview();
    };
}

function onOverviewClick(event) {
    if (LOG) console.log(`onOverviewClick(${event}) called`);
}


export function onPlayerClick(event) {
    if (LOG) console.log(`onPlayerClick(${event}) called`);
    let cell = event.target.parentElement;
    let id = cell.id.split('-');
    let player = event.target.player;
    // reset the board
    deleteOverview();
    // display the possible moves
    let cells = getCorridorPossiblePosition(parseInt(id[1]), parseInt(id[2]));
    let overview;
    for (let cell of cells) {
        let cellElement = document.getElementById('cell-' + cell[0] + '-' + cell[1]);
        overview  = document.createElement('div');
        overview.addEventListener('click', onOverviewClick);
        overview.className = 'position_overview';
        overview.line = cell[0];
        overview.column = cell[1];
        overview.id = 'overview-' + cell[0] + '-' + cell[1];
        cellElement.appendChild(overview);
        if (isPlayerTurn(player)) cellElement.overviewed = true;
    }
    cell.selected = true;
}

/*
function addPlayers() {
    // Display players
    player_a = document.createElement('div');
    player_a.className = 'player';
    player_a.id = 'player-a';
    player_a.backgroundColor = PLAYER_A_COLOR;
    player_a.line = PLAYER_A_START_LINE;
    player_a.column = 2;
    player_a.player = PLAYER_A;
    player_a.addEventListener('click', onPlayerClick);
    if (LOG) player_a.textContent = 'A';
    let cell = document.getElementById('cell-' + player_a.line + '-' + player_a.column);
    cell.appendChild(player_a);

    player_b = document.createElement('div');
    player_b.className = 'player';
    player_b.id = 'player-b';
    player_b.backgroundColor = PLAYER_B_COLOR;
    player_b.line = PLAYER_B_START_LINE;
    player_b.column = 2;
    player_b.player = PLAYER_B;
    player_b.addEventListener('click', onPlayerClick);
    if (LOG) player_b.textContent = 'B';
    cell = document.getElementById('cell-' + player_b.line + '-' + player_b.column);
    cell.appendChild(player_b);
}
*/

export function addPlayers(board_div, board) {
    if (LOG) console.log(`addPlayers(${board_div}, ${board}) called`);
    // Display players
    player_a = document.createElement('div');
    player_a.className = 'player';
    player_a.id = 'player-a';
    player_a.backgroundColor = PLAYER_A_COLOR;
    player_a.line = PLAYER_A_START_LINE;
    player_a.column = 2;
    player_a.player = PLAYER_A;
    player_a.addEventListener('click', onPlayerClick);
    if (LOG) player_a.textContent = 'A';
    let cell = document.getElementById('cell-' + player_a.line + '-' + player_a.column);
    getGame().addPlayer(new Player());
    getGame()['p1_pos'] = [player_a.line, player_a.column];
    cell.appendChild(player_a);

    player_b = document.createElement('div');
    player_b.className = 'player';
    player_b.id = 'player-b';
    player_b.backgroundColor = PLAYER_B_COLOR;
    player_b.line = PLAYER_B_START_LINE;
    player_b.column = 2;
    player_b.player = PLAYER_B;
    player_b.addEventListener('click', onPlayerClick);
    if (LOG) player_b.textContent = 'B';
    cell = document.getElementById('cell-' + player_b.line + '-' + player_b.column);
    getGame()['p2_pos'] = [player_b.line, player_b.column];
    cell.appendChild(player_b);
}