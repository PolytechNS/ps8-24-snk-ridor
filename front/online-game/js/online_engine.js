import { BOARD_HEIGHT, BOARD_WIDTH, getGame, Event, Player } from './online_models.js';
import { LOG } from './online_main.js';
import { display_message, on_wall_over, on_wall_out, on_wall_click, display_board_one_player, init_board } from './online_board.js';
import { display_game, display_board } from './online_display.js';
import { setupAnswer } from '../online-game.js';
import { move } from '../online-game.js';

const LINES = BOARD_HEIGHT;
const COLUMNS = BOARD_WIDTH;

const PLAYER_A = 1;
const PLAYER_B = 2;

const PLAYER_A_COLOR = 'red';
const PLAYER_B_COLOR = 'blue';

const PLAYER_A_START_LINE = 1;
const PLAYER_B_START_LINE = LINES;

let board_data = [];
let board_visibility = [];

let player_a = 1;
let player_b = 2;

let turn = 0;

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
    initialise_game();
}

export function next_player(event = null) {
    if (LOG) console.log(`next_player() called, fin du tour ${getGame().turn_count}`);
    let game = getGame();

    //update board in front
    display_game(game);

    // the fog of war is updated on display_board
    if (game.turn_count == 200) {
        display_message('Égalité', 'final_message');
        return;
    } else if (game.turn_count == 190) {
        display_message('10 derniers tours !', 'info_message');
    }

    game.nextPlayer();
    console.log(`C'est au joueur ${game.getCurrentPlayer()} de jouer`);
    if (game.getCurrentPlayer() === game.getOnlinePlayer()) {
        console.log("C'est à vous de jouer");
        display_message('', 'action_message');
    }
    document.getElementById('turn').textContent = game.turn_count;

    document.getElementById('player').textContent = ['', 'A', 'B'][game.getCurrentPlayer()];
}

export function getCorridorPossiblePosition(column, line) {
    if (LOG) console.log(`getCorridorPossiblePosition(${column}, ${line}) called`);
    let cells = [];
    if (line > 1) {
        // s'il n'y a pas de mur
        if (!document.getElementById('h-wall-' + column + '-' + line).classList.contains('placed')) {
            // s'il n'y a pas de joueur
            if (document.getElementById('cell-' + column + '-' + (line - 1)).childElementCount == 0) {
                cells.push([column, line - 1]);
            } else {
                if (line > 2 && !document.getElementById('h-wall-' + column + '-' + (line - 2)).classList.contains('placed')) {
                    // si l'enfant de la cellule n'est pas un overview
                    if (!document.getElementById('cell-' + column + '-' + (line - 1)).children[0].classList.contains('position_overview')) {
                        cells.push([column, line - 2]);
                    }
                }
            }
        }
    }
    if (line < LINES) {
        // s'il n'y a pas de mur
        if (!document.getElementById('h-wall-' + column + '-' + (line + 1)).classList.contains('placed')) {
            // s'il n'y a pas de joueur
            if (document.getElementById('cell-' + column + '-' + (line + 1)).childElementCount == 0) {
                cells.push([column, line + 1]);
            } else {
                if (line < LINES - 1 && !document.getElementById('h-wall-' + column + '-' + (line + 1)).classList.contains('placed')) {
                    // si l'enfant de la cellule n'est pas un overview
                    if (!document.getElementById('cell-' + column + '-' + (line + 1)).children[0].classList.contains('position_overview')) {
                        cells.push([column, line + 2]);
                    }
                }
            }
        }
    }
    if (column > 1) {
        // s'il n'y a pas de mur
        if (!document.getElementById('v-wall-' + (column - 1) + '-' + line).classList.contains('placed')) {
            // s'il n'y a pas de joueur
            if (document.getElementById('cell-' + (column - 1) + '-' + line).childElementCount == 0) {
                cells.push([column - 1, line]);
            } else {
                if (column > 2 && !document.getElementById('v-wall-' + (column - 2) + '-' + line).classList.contains('placed')) {
                    // si l'enfant de la cellule n'est pas un overview
                    if (!document.getElementById('cell-' + (column - 1) + '-' + line).children[0].classList.contains('position_overview')) {
                        cells.push([column - 2, line]);
                    }
                }
            }
        }
    }
    if (column < COLUMNS) {
        // s'il n'y a pas de mur
        if (!document.getElementById('v-wall-' + column + '-' + line).classList.contains('placed')) {
            // s'il n'y a pas de joueur
            if (document.getElementById('cell-' + (column + 1) + '-' + line).childElementCount == 0) {
                cells.push([column + 1, line]);
            } else {
                if (column < COLUMNS - 1 && !document.getElementById('v-wall-' + column + '-' + line).classList.contains('placed')) {
                    // si l'enfant de la cellule n'est pas un overview
                    if (!document.getElementById('cell-' + (column + 1) + '-' + line).children[0].classList.contains('position_overview')) {
                        cells.push([column + 2, line]);
                    }
                }
            }
        }
    }
    if (LOG) console.log(`getCorridorPossiblePosition(${column}, ${line}) returns ${cells}`);
    return cells;
}

export function move_player(player, column, line) {
    if (LOG) console.log(`move_player(${player}, ${column}, ${line}) called`);
    move(`${column}${line}`);
    next_player();
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
}

function isPlayerTurn(player) {
    if (LOG) console.log(`isPlayerTurn(${player}) called`);
    turn = getGame().turn_count;
    let retour = turn % 2 == player - 1;
    if (LOG) console.log(`isPlayerTurn(${player}) returns ${retour}`);
    return retour;
}

function getPlayerTurn() {
    if (LOG) console.log(`getPlayerTurn() called`);
    turn = getGame().turn_count - 1;
    let retour = [player_a, player_b][turn % 2];
    if (LOG) console.log(`getPlayerTurn() returns ${retour}`);
    return retour;
}

export function deleteOverview() {
    if (LOG) console.log(`deleteOverview() called`);
    let overview = document.querySelectorAll('.position_overview');
    overview.forEach((element) => {
        element.parentElement.overview = false;
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

    // prepare and send the initial position to the server
    let answer = `${column}${line}`;
    if (LOG) {
        if (getGame().getOnlinePlayer() == 1) {
            console.log(`First player placed on [${answer}]`);
        } else {
            console.log(`Second player placed on [${answer}]`);
        }
    }
    setupAnswer(answer);
}

export function onCellClick(event) {
    if (LOG) console.log(`onCellClick(${event}) called`);
    let cell;
    if (event.target.className == 'position_overview' || event.target.className.includes('player')) {
        cell = event.target.parentElement;
    } else {
        cell = event.target;
    }

    let id = cell.id.split('-');
    let column = parseInt(id[1]); // x
    let line = parseInt(id[2]); // y
    console.log(`Cell clicked: [${column}, ${line}]`);

    // if cell contains a player
    let board = getGame();
    let cells;

    let position = board.getPlayerPosition(board.getCurrentPlayer());
    console.log(`Current player position: [${position[0]}, ${position[1]}], clicked cell: [${column}, ${line}]`);
    if (board.getPlayerPosition(board.getCurrentPlayer())[0] == column && board.getPlayerPosition(board.getCurrentPlayer())[1] == line) {
        cells = getCorridorPossiblePosition(column, line);
        for (let cell of cells) {
            let cellElement = document.getElementById('cell-' + cell[0] + '-' + cell[1]);
            let overview = document.createElement('div');
            overview.className = 'position_overview';
            overview.line = cell[0];
            overview.column = cell[1];
            overview.id = 'overview-' + cell[0] + '-' + cell[1];
            cellElement.appendChild(overview);
            cellElement.overview = true;
        }
        return;
    }

    if (cell.selected) {
        cell.selected = false;
    }
    if (cell.overview) {
        //getPlayerTurn().classList.toggle('border-active');
        move_player(getPlayerTurn(), column, line);
    } else {
        deleteOverview();
    }
}

function onOverviewClick(event) {
    if (LOG) console.log(`onOverviewClick(${event}) called`);
}

export function onPlayerClick(event) {
    if (LOG) console.log(`onPlayerClick(${event}) called`);
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

    // reset the board
    deleteOverview();
    // display the possible moves
    let cells = getCorridorPossiblePosition(parseInt(id[1]), parseInt(id[2]));
    let overview;
    for (let cell of cells) {
        let cellElement = document.getElementById('cell-' + cell[0] + '-' + cell[1]);
        overview = document.createElement('div');
        overview.addEventListener('click', onOverviewClick);
        overview.className = 'position_overview';
        overview.line = cell[0];
        overview.column = cell[1];
        overview.id = 'overview-' + cell[0] + '-' + cell[1];
        cellElement.appendChild(overview);
        if (isPlayerTurn(player)) cellElement.overview = true;
    }

    cell.selected = true; // This line seems to set a property 'selected' on the cell. Ensure this is managed as intended based on border toggle.
}

function addPlayer(board_div, board, column) {
    if (LOG) console.log(`addPlayer(${board_div}, ${board}, ${column}) called`);

    console.log(board.getOnlinePlayer());
    // if there is no player, add the first one
    if (board.getOnlinePlayer() == 1) {
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
            img.src = '../resources/persons/titan_eren.png';
            img.alt = 'Eren';
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
        display_message('Attente du joueur adverse', 'action_message', false);
    }
    // if there is already a player, add the second one
    else if (board.getOnlinePlayer() == 2) {
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
            img.src = '../../resources/persons/humain_annie.png';
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
        display_message('Attente du premier coup du joueur adverse', 'action_message', false);
    }

    // if there are already two players, do nothing
    else {
        if (LOG) console.error('There are already two players on the board');
        return;
    }
}

export function addPlayers(board_div, board) {
    if (LOG) console.log(`addPlayers(${board_div}, ${board}) called`);

    display_message("Dans l'attente de l'adversaire", 'action_message', false);
    return;
}
