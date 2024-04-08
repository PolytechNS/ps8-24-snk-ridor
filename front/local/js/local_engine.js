import { BOARD_HEIGHT, BOARD_WIDTH, getGame, Event, Player } from './local_models.js';
import { LOG } from './local_main.js';
import { updateFogOfWar } from './local_fogwar.js';
import { updatePath } from './local_pathFinding.js';
import { display_message, on_wall_over, on_wall_out, on_wall_click, display_board_one_player, init_board } from './local_board.js';
import { display_board, placePlayer } from './local_display.js';

const LINES = BOARD_HEIGHT;
const COLUMNS = BOARD_WIDTH;
const WALLS = 10;
const WALL_LENGTH = 2;

const PLAYER_A = 1;
const PLAYER_B = 2;

const PLAYER_A_COLOR = 'red';
const PLAYER_B_COLOR = 'blue';

const PLAYER_A_START_LINE = 1;
const PLAYER_B_START_LINE = LINES;

let board_data = [];
let board_visibility = [];

let player_a;
let player_b;

let turn = 0;

function main() {
    initialise_game();
    //init_board();
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
}

export function newGame() {
    if (LOG) console.log(`newGame() called`);
    board_data = [];
    board_visibility = [];
    player_a = null;
    player_b = null;
    turn = 0;
    main();
}

export function next_player(event = null) {
    if (LOG) console.log(`next_player() called`);
    getGame().getCurrentPlayer().updateProfile();
    updateFogOfWar(event);
    deleteOverview();
    turn++;
    if (turn == 200) {
        display_message('Égalité', 'final_message');
        //alert('Draw'); // TODO : change this to a better way to display the victory
        return;
    } else if (turn == 190) {
        display_message('10 derniers tours !', 'info_message');
    }
    document.getElementById('turn').textContent = turn + 1;
    getGame().nextPlayer();
    updatePath(getGame().getCurrentPlayer());
    document.getElementById('player').textContent = ['', 'A', 'B'][getPlayerTurn().player];
}

export function getCorridorPossiblePosition(line, column) {
    let cells = [];
    if (line > 0) {
        if (!document.getElementById('h-wall-' + (line - 1) + '-' + column).classList.contains('placed')) {
            if (document.getElementById('cell-' + (line - 1) + '-' + column).childElementCount == 0) {
                cells.push([line - 1, column]);
            } else {
                if (line > 1 && !document.getElementById('h-wall-' + (line - 2) + '-' + column).classList.contains('placed')) {
                    cells.push([line - 2, column]);
                }
            }
        }
    }
    if (line < LINES - 1) {
        if (!document.getElementById('h-wall-' + line + '-' + column).classList.contains('placed')) {
            if (document.getElementById('cell-' + (line + 1) + '-' + column).childElementCount == 0) {
                cells.push([line + 1, column]);
            } else {
                if (line < LINES - 2 && !document.getElementById('h-wall-' + (line + 1) + '-' + column).classList.contains('placed')) {
                    cells.push([line + 2, column]);
                }
            }
        }
    }
    if (column > 0) {
        if (!document.getElementById('v-wall-' + line + '-' + (column - 1)).classList.contains('placed')) {
            if (document.getElementById('cell-' + line + '-' + (column - 1)).childElementCount == 0) {
                cells.push([line, column - 1]);
            } else {
                if (column > 1 && !document.getElementById('v-wall-' + line + '-' + (column - 2)).classList.contains('placed')) {
                    cells.push([line, column - 2]);
                }
            }
        }
    }
    if (column < COLUMNS - 1) {
        if (!document.getElementById('v-wall-' + line + '-' + column).classList.contains('placed')) {
            if (document.getElementById('cell-' + line + '-' + (column + 1)).childElementCount == 0) {
                cells.push([line, column + 1]);
            } else {
                if (column < COLUMNS - 2 && !document.getElementById('v-wall-' + line + '-' + (column + 1)).classList.contains('placed')) {
                    cells.push([line, column + 2]);
                }
            }
        }
    }
    return cells;
}

export function getCorridorPossiblePositionForPath(column, line) {
    if (LOG) console.log(`getCorridorPossiblePositionForPath(${column}, ${line}) called`);
    let cells = [];
    let wall;
    if (column > 1) {
        // if the player is not on the first column, check the left cell
        wall = document.getElementById(`v-wall-${column - 1}-${line}`);
        if (!wall.classList.contains('placed') && !wall.classList.contains('wall-hover')) {
            // if there is a wall on the way
            cells.push([column - 1, line]);
        }
    }
    if (column < COLUMNS) {
        console.log(`column : ${column}, line : ${line}`);
        // if the player is not on the last line, check the right cell
        wall = document.getElementById(`v-wall-${column}-${line}`);
        if (!wall.classList.contains('placed') && !wall.classList.contains('wall-hover')) {
            // if there is a wall on the way
            cells.push([column + 1, line]);
        }
    }
    if (line > 1) {
        // if the player is not on the first line, check the top cell
        wall = document.getElementById(`h-wall-${column}-${line}`);
        if (!wall.classList.contains('placed') && !wall.classList.contains('wall-hover')) {
            // if there is a wall on the way
            cells.push([column, line - 1]);
        }
    }
    if (line < LINES) {
        // if the player is not on the last line, check the bottom cell
        wall = document.getElementById(`h-wall-${column}-${line + 1}`);
        if (!wall.classList.contains('placed') && !wall.classList.contains('wall-hover')) {
            // if there is a wall on the way
            cells.push([column, line + 1]);
        }
    }
    if (LOG) console.log(`getCorridorPossiblePositionForPath(${column}, ${line}) returns ${cells}`);
    return cells;
}

function checkVictory(player) {
    if (LOG) console.log(`checkVictory(${player}) called`);
    // if the player is on the opposite line, it remains one move for the other player to win
    // if the other player place himself on the opposite line, it is a draw
    // on the other case, the first player wins
    let wins = [];
    for (let p of getGame().players) {
        if (p.position[0] == p.goal) {
            // if the player has reach the opposite line
            wins.push(p);
        }
    }

    if (wins.length == 1) {
        if (1 == turn % 2) {
            // if it is an odd turn, it is player A's turn, so player B has won
            display_message(`Victoire du joueur ${wins[0].id}`, 'final_message');
            return true;
        } else {
            // if it is an even turn, it is player B's turn, so player B has one move to make a draw
            display_message(`Dernier tour\nLe joueur ${wins[0].id} a atteint son objectif`, 'info_message');
            return false;
        }
    } else if (wins.length == 2) {
        // if both players have reached the opposite line, it is a draw
        display_message(`Égalité`, 'final_message');
        return true;
    }
    return false;
}

export function place_player(player, line, column) {
    if (LOG) console.log(`place_player(${player}, ${line}, ${column}) called`);

    console.log(player);
    let event = new Event('place', player.player, [null, null], [line, column]);
    placePlayer(event);

    next_player(event);
}

export function move_player(player, line, column) {
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
    getGame().getCurrentPlayer().move([line, column]);

    if (checkVictory(player)) {
        updateFogOfWar(new Event('end', player.player, [player.line, player.column]));
        deleteOverview();
        return;
    }
    let event = new Event('move', player.player, [old_line, old_column], [line, column]);
    next_player(event);
}

export function display() {
    if (LOG) console.log(`display() called`);
    let board = document.getElementById('board');
    board.innerHTML = '';

    board.style.gridTemplateColumns = `repeat(${COLUMNS * 2 - 1}, min-content)`;
    board.style.gridTemplateRows = `repeat(${LINES * 2 - 1}, min-content)`;

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
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
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
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
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

    // Display the players
    addPlayers(board, getGame());

    // display fog of war
    updateFogOfWar('beginning');
}

function isPlayerTurn(player) {
    if (LOG) console.log(`isPlayerTurn(${player}) called`);
    let retour = turn % 2 == player - 1;
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
    overviewes.forEach((element) => {
        element.parentElement.overviewed = false;
        element.remove();
    });
}

export function firstOnCellClick(event) {
    if (LOG) console.log(`firstOnCellClick(${event}) called`);
    let cell = event.target;
    let id = cell.id.split('-');
    let column = parseInt(id[1]); // x
    let line = parseInt(id[2]); // y

    addPlayer(cell.parentElement, getGame(), column);
}

export function onCellClick(event) {
    if (LOG) console.log(`onCellClick(${event}) called`);
    let cell = event.target;
    let id = cell.id.split('-');
    let column = parseInt(id[1]); // x
    let line = parseInt(id[2]); // y

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
        getPlayerTurn().classList.toggle('border-active');
        move_player(getPlayerTurn(), line, column);
    } else {
        deleteOverview();
    }
}

function onOverviewClick(event) {
    if (LOG) console.log(`onOverviewClick(${event}) called`);
}

export function onPlayerClick(event) {
    if (LOG) console.log(`onPlayerClick(${event}) called`);
    console.log(`OnPlayerClick called`);
    let cell;
    if (event.target instanceof HTMLImageElement) {
        cell = event.target.parentElement.parentElement;
    } else {
        cell = event.target.parentElement;
    }
    let id = cell.id.split('-');
    let player;
    if (event.target instanceof HTMLImageElement) {
        player = event.target.parentElement.player;
    } else {
        player = event.target.player;
    }

    console.log(`cell : ${cell.id}`);
    console.log(`Player ${player} clicked`);
    // reset the board
    deleteOverview();
    // display the possible moves
    let cells = getCorridorPossiblePosition(parseInt(id[1]), parseInt(id[2]));
    let overview;
    for (let cell of cells) {
        console.log(`cell : ${cell}`);
        let cellElement = document.getElementById('cell-' + cell[0] + '-' + cell[1]);
        console.log(`cellElement : ${cellElement}, ${cellElement.id}`);
        overview = document.createElement('div');
        overview.addEventListener('click', onOverviewClick);
        overview.className = 'position_overview';
        overview.line = cell[0];
        overview.column = cell[1];
        overview.id = 'overview-' + cell[0] + '-' + cell[1];
        cellElement.appendChild(overview);
        console.log(cellElement.contains(overview));
        if (isPlayerTurn(player)) cellElement.overviewed = true;
    }

    cell.selected = true; // This line seems to set a property 'selected' on the cell. Ensure this is managed as intended based on border toggle.
}

function addPlayer(board_div, board, column) {
    if (LOG) console.log(`addPlayer(${board_div}, ${board}, ${column}) called`);

    // if there is no player, add the first one
    if (board.players.length == 0) {
        player_a = document.createElement('div');
        player_a.className = 'player';
        player_a.id = 'player-a';
        player_a.backgroundColor = PLAYER_A_COLOR;
        player_a.line = PLAYER_A_START_LINE;
        player_a.column = column;
        player_a.player = PLAYER_A;
        if (LOG) player_a.textContent = 'A';
        if (!LOG) {
            let img = document.createElement('img');
            img.src = 'resources/persons/titan_eren.png';
            img.alt = 'Annie';
            img.classList.add('pawn-avatar');
            player_a.appendChild(img);
        }
        player_a.addEventListener('click', onPlayerClick);
        let cell = document.getElementById('cell-' + player_a.line + '-' + player_a.column);
        let player_object = new Player();
        player_object.move([player_a.column, player_a.line]);
        // do not add the player to the board, this is done in the Player class
        getGame()['p1_pos'] = [player_a.column, player_a.line]; // x, y
        cell.appendChild(player_a);

        display_board_one_player(board_div, board);
        display_message('Joueur 2 : Cliquez sur une case pour placer votre pion', 'action_message', false);
    }
    // if there is already a player, add the second one
    else if (board.players.length == 1) {
        player_b = document.createElement('div');
        player_b.className = 'player';
        player_b.id = 'player-b';
        player_b.backgroundColor = PLAYER_B_COLOR;
        player_b.line = PLAYER_B_START_LINE;
        player_b.column = column;
        player_b.player = PLAYER_B;
        if (LOG) player_b.textContent = 'B';
        if (!LOG) {
            let img = document.createElement('img');
            img.src = 'resources/persons/humain_annie.png';
            img.alt = 'Annie';
            img.classList.add('pawn-avatar');
            player_b.appendChild(img);
        }
        player_b.addEventListener('click', onPlayerClick);
        let cell = document.getElementById('cell-' + player_b.line + '-' + player_b.column);
        let player_object = new Player();
        player_object.move([player_b.column, player_b.line]);
        // do not add the player to the board, this is done in the Player class
        getGame()['p2_pos'] = [player_b.column, player_b.line]; // x, y
        cell.appendChild(player_b);

        display_board(board);
        display_message('Début de la partie !', 'action_message', 1500);
    }
    // if there are already two players, do nothing
    else {
        if (LOG) console.log('There are already two players on the board');
        return;
    }
}

export function addPlayers(board_div, board) {
    if (LOG) console.log(`addPlayers(${board_div}, ${board}) called`);

    display_message('Cliquez sur une case pour placer votre pion', 'action_message', false);

    return;
    // Display players
    player_a = document.createElement('div');
    player_a.className = 'player';
    player_a.id = 'player-a';
    player_a.backgroundColor = PLAYER_A_COLOR;
    player_a.line = PLAYER_A_START_LINE;
    player_a.column = 2;
    player_a.player = PLAYER_A;
    if (LOG) player_a.textContent = 'A';
    if (!LOG) {
        let img = document.createElement('img');
        img.src = 'resources/persons/titan_eren.png';
        img.alt = 'Annie';
        img.classList.add('pawn-avatar');
        player_a.appendChild(img);
    }
    player_a.addEventListener('click', onPlayerClick);
    let cell = document.getElementById('cell-' + player_a.line + '-' + player_a.column);
    new Player();
    // do not add the player to the board, this is done in the Player class
    getGame()['p1_pos'] = [player_a.line, player_a.column];
    cell.appendChild(player_a);

    player_b = document.createElement('div');
    player_b.className = 'player';
    player_b.id = 'player-b';
    player_b.backgroundColor = PLAYER_B_COLOR;
    player_b.line = PLAYER_B_START_LINE;
    player_b.column = 2;
    player_b.player = PLAYER_B;
    if (LOG) player_b.textContent = 'B';
    if (!LOG) {
        let img = document.createElement('img');
        img.src = 'resources/persons/humain_annie.png';
        img.alt = 'Annie';
        img.classList.add('pawn-avatar');
        player_b.appendChild(img);
    }
    player_b.addEventListener('click', onPlayerClick);
    cell = document.getElementById('cell-' + player_b.line + '-' + player_b.column);
    getGame()['p2_pos'] = [player_b.line, player_b.column];
    new Player();
    // do not add the player to the board, this is done in the Player class
    cell.appendChild(player_b);
}
