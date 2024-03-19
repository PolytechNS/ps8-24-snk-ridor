import { Board } from '../../shared/board.js';
import { newGame } from '../../shared/engine.js';
import { onCellClick, onWallClick, onWallOut, onWallOver } from '../../shared/engine.js';

/*
 * Uses the board to display the game board
 * @param {Board} the board to display
 * @return {void}
 * @side-effect: display the board
 * @side-effect: add event listeners to the cells and walls
 */
export function display_board(board) {
    let BOARD_W = board.width();
    let BOARD_H = board.height();

    // reset the board
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let k = 0; k < BOARD_W; k++) {
        // for each row, create a line of cells and vertical walls
        for (let j = 0; j < BOARD_H; j++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + k + '-' + j;
            cell.addEventListener('click', onCellClick);
            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (j < BOARD_H - 1) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + k + '-' + j;
                wall.addEventListener('mouseover', onWallOver);
                wall.addEventListener('mouseout', onWallOut);
                wall.addEventListener('click', onWallClick);
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let j = 0; j < BOARD_H; j++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (k < BOARD_W - 1) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + k + '-' + j;
                wall.addEventListener('mouseover', onWallOver);
                wall.addEventListener('mouseout', onWallOut);
                wall.addEventListener('click', onWallClick);
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the last row and the last column
            if (k < BOARD_W - 1 && j < BOARD_H - 1) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + k + '-' + j;
                wall.addEventListener('mouseover', onWallOver);
                wall.addEventListener('mouseout', onWallOut);
                wall.addEventListener('click', onWallClick);
                board_div.appendChild(wall);
            }
        }

        // display placed walls
        let walls = board.getWalls();
        let wall;
        for (let i = 0; i < walls.length; i++) {
            wall = walls[e];
            // a wall is composed of two "unit walls"
            // 1 vertical, 2 horizontal
            // a wall have the coordinates of the top left cell

            // if the wall is horizontal
            if (wall[1] === 0) {
                //
            } else if (wall[1] === 1) {
            } else {
                throw new Error(`Invalid wall orientation: ${x}, ${y}, ${r}`);
            }
        }
    }

    // add the players to the board
    for (let i = 1; i <= 2; i++) {
        // for the two players, create a player and add it to the board
        let position = board.getPlayerPosition(i);

        // if the player is not on the board yet, or hide by fog of war
        // do not display it
        if (position[0] != null && position[1] != null && position[0] != undefined && position[1] != undefined) {
            let player = document.createElement('div');
            player.classList.add('player', 'player-' + i);
            player.id = 'player-' + i;

            let img = document.createElement('img');
            //img.src = 'resources/persons/' + board.getPlayer(i).avatar + '.png';
            img.src = 'resources/persons/humain_annie.png';
            img.alt = 'paw ' + i;
            img.classList.add('pawn-avatar');
            player.appendChild(img);

            console.log('cell-' + position.y + '-' + position.x);

            let cell = document.getElementById('cell-' + position.y + '-' + position.x);
            cell.appendChild(player);
        }

        // change the number of walls for the player
        console.log('player-' + (1 + i) + '-profile');
        if (i == board.getPlayer) {
            console.log('player-' + (1 + i) + '-profile');
        }
        let player_profile = document.getElementById('player-' + (1 + i) + '-profile');
        player_profile.getElementsByClassName('walls')[0].textContent = board.getPlayer(i).remainingWalls();

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        img.src = 'resources/persons/' + board.getPlayer(i).avatar + '.png';
    }

    // change the turn number
    let turn_number = document.getElementById('turn');
    turn_number.textContent = board.getTurnCount();
}

export function display_initial_board(playerId, board) {
    console.log('display_initial_board');
    let BOARD_W = board.width();
    let BOARD_H = board.height();

    // reset the board
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let k = BOARD_W; k > 0; k--) {
        // for each row, create a line of cells and vertical walls
        for (let j = 1; j <= BOARD_H; j++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + k + '-' + j;
            if ((playerId === 1 && k === 1) || (playerId === 2 && k === BOARD_W)) {
                cell.addEventListener('click', placePlayer);
            }

            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (j < BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + k + '-' + j;
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let j = 1; j <= BOARD_H; j++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (k < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + k + '-' + j;
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the last row and the last column
            if (k < BOARD_W && j < BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + k + '-' + j;
                board_div.appendChild(wall);
            }
        }
    }
    document.documentElement.style.setProperty('--board-width', BOARD_W);
}

function placePlayer(event) {
    let cell = event.target;
    let coords = cell.id
        .split('-')
        .slice(1)
        .map((x) => parseInt(x));
    board.placePlayer(1, coords[0], coords[1]);
}

function resetOverviews() {
    let cells = document.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        // remove all overviews
        let cell = cells[i];
        let overviews = cell.getElementsByClassName('position_overview');
        for (let j = 0; j < overviews.length; j++) {
            overviews[j].remove();
        }
    }
}

export function display_overviews(positions) {
    resetOverviews();
    if (positions == null || positions == undefined || positions.length == 0) {
        return;
    }

    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let cell = document.getElementById('cell-' + position.y + '-' + position.x);

        let overview = document.createElement('div');
        overview.classList.add('position_overview');
        cell.appendChild(overview);
    }
}

export function wall_over_display(positions, vertical = true) {
    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let wall = document.getElementById((vertical ? 'v' : 'h') + '-wall-' + position.y + '-' + position.x);
        wall.classList.add('wall-over');
    }
    // add the small wall to made the junction
    document.getElementById('s-wall-' + positions[0].y + '-' + positions[0].x).classList.add('wall-over');
}

export function wall_out_display(positions, vertical = true) {
    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let wall = document.getElementById((vertical ? 'v' : 'h') + '-wall-' + position.y + '-' + position.x);
        wall.classList.remove('wall-over');
    }
    // remove the small wall that made the junction
    document.getElementById('s-wall-' + positions[0].y + '-' + positions[0].x).classList.remove('wall-over');
}

/*
 * Display a message for 3 seconds
 * @param {string} message - the message to display
 * @param {string} (Optionnal) category - the category of the message
 * @param {int} (Optionnal) timeout - the time before the message is removed (in ms)
 * @return {void} or {HTMLElement}
 * @side-effect: display a message
 */
export function display_message(message, { category = 'info_message', timeout = 3000 } = {}) {
    /*
     * The possible categories are:
     * - info_message
     * - forbidden_message
     * - dev_message
     */
    let message_div = document.createElement('div');
    message_div.classList.add('alert', category);
    message_div.textContent = message;
    message_div.style.display = 'block';
    document.getElementsByTagName('body')[0].appendChild(message_div);
    if (timeout > 0) {
        setTimeout(function () {
            message_div.style.display = 'none';
            message_div.remove();
        }, timeout);
    } else {
        return message_div;
    }
}

export function display_action_message(message, timeout = 0, buttons = [], cancelable = true, blocking = true) {
    // remove the previous message
    let previous_message = document.getElementsByClassName('action_message');
    for (let i = 0; i < previous_message.length; i++) {
        previous_message[i].remove();
    }

    // if the message is empty, do not display it
    if (message == '') {
        return;
    }

    let message_div = document.createElement('div');
    message_div.classList.add('action_message');
    if (blocking) {
        message_div.classList.add('blocking');
    }
    if (cancelable) {
        message_div.classList.add('cancelable');
    }
    for (let i = 0; i < buttons.length; i++) {
        let button = document.createElement('button');
        button.textContent = buttons[i].text;
        button.addEventListener('click', buttons[i].callback);
        message_div.appendChild(button);
    }
    message_div.textContent = message;
    message_div.style.display = 'block';
    document.getElementsByTagName('body')[0].appendChild(message_div);
    if (timeout > 0) {
        setTimeout(function () {
            message_div.style.display = 'none';
            message_div.remove();
        }, timeout);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    newGame('player1', 'player2', true);
});
