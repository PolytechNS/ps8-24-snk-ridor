import { newGame, onCellClick, deleteOverview } from './online_engine.js';
import { BOARD_HEIGHT, BOARD_WIDTH, getGame } from './online_models.js';
import { on_wall_click, on_wall_over, on_wall_out } from './online_board.js';
import { LOG } from './online_main.js';
import { updateFogOfWarFromBack } from './online_fogwar.js';

let global_board;
/*
 * Uses the board to display the game board
 * @param {Board} the board to display
 * @return {void}
 * @side-effect: display the board
 * @side-effect: add event listeners to the cells and walls
 */
export function display_board(board) {
    if (LOG) console.log('display_board');
    let BOARD_W = BOARD_WIDTH;
    let BOARD_H = BOARD_HEIGHT;

    // reset the board
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let y = BOARD_H; y > 0; y--) {
        // for each row, create a line of cells and vertical walls
        for (let x = 1; x <= BOARD_W; x++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + x + '-' + y;
            if (LOG) cell.textContent = `[${x}, ${y}]`;
            cell.addEventListener('click', onCellClick);
            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + x + '-' + y;
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let x = 1; x <= BOARD_W; x++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (1 < y && y <= BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + x + '-' + y;
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the first or the last row and the last column
            if (1 < y && y <= BOARD_W && x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }
        }
    }

    // add the players to the board
    for (let i = 1; i <= 2; i++) {
        // for the two players, create a player and add it to the board
        let position = board.getPlayerPosition(i);

        // if the player is not on the board yet, or hide by fog of war
        // do not display it
        if (position[0] != null && position[1] != null && position[0] != undefined && position[1] != undefined && position[0] > 0 && position[1] > 0) {
            let player = document.createElement('div');
            player.classList.add('player', 'player-' + i);
            player.id = 'player-' + i;

            let img = document.createElement('img');
            //img.src = 'resources/persons/' + board.getPlayer(i).avatar + '.png';
            if (i == 1) {
                img.src = '../resources/persons/titan_eren.png';
            } else {
                img.src = '../resources/persons/humain_annie.png';
            }
            img.alt = 'paw ' + i;
            img.classList.add('pawn-avatar');
            player.appendChild(img);

            if (LOG) console.log('position', position);
            let cell = document.getElementById('cell-' + position[0] + '-' + position[1]);
            cell.appendChild(player);
        }

        // change the number of walls for the player
        let player_profile;
        if (i == board.getPlayer) {
            player_profile = document.getElementById('self_profile');
        } else {
            player_profile = document.getElementById('other_profile');
        }
        player_profile.getElementsByClassName('walls')[0].textContent = board.remainingWalls();

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        //img.src = '../../resources/persons/' + board.getPlayer(i).avatar + '.png';
    }

    // change the turn number
    let turn_number = document.getElementById('turn');
    turn_number.textContent = board.getTurnCount();
}

export function display_game(game) {
    if (LOG) console.log('displayGame', game);
    let board = game.board;
    global_board = board;
    let BOARD_W = board.length;
    let BOARD_H = board[0].length;

    // reset the board
    deleteOverview();
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let y = BOARD_H; y > 0; y--) {
        // for each row, create a line of cells and vertical walls
        for (let x = 1; x <= BOARD_W; x++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + x + '-' + y;
            cell.addEventListener('click', onCellClick);

            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + x + '-' + y;
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let x = 1; x <= BOARD_W; x++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (1 < y && y <= BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + x + '-' + y;
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the first or the last row and the last column
            if (1 < y && y <= BOARD_W && x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + x + '-' + y;
                wall.addEventListener('mouseover', on_wall_over);
                wall.addEventListener('mouseout', on_wall_out);
                wall.addEventListener('click', on_wall_click);
                board_div.appendChild(wall);
            }
        }
    }
    document.documentElement.style.setProperty('--board-width', BOARD_W);

    // add the players profile
    for (let i = 1; i <= 2; i++) {
        // change the number of walls for the player
        let player_profile;
        if (i == 1) {
            player_profile = document.getElementById('self_profile');
        } else {
            player_profile = document.getElementById('other_profile');
        }
        player_profile.getElementsByClassName('walls')[0].textContent = game.remainingWalls(i);

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        //img.src = 'resources/persons/' + game.getPlayer(i).avatar + '.png';
    }

    // change the turn number
    let turn_number = document.getElementById('turn');
    turn_number.textContent = game.getTurnCount();

    // add players walls
    let walls = game.getPlayerWalls('own');
    if (LOG) console.log('walls', walls);
    for (let i = 0; i < walls.length; i++) {
        let wall = walls[i];
        // si le mur est vertical
        if (wall[1] == 1) {
            document.getElementById('v-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('v-wall-' + wall[0][0] + '-' + (wall[0][1] - 1)).classList.add('placed');
        } else {
            // sinon le mur est horizontal
            document.getElementById('h-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('h-wall-' + (wall[0][0] - 0 + 1) + '-' + wall[0][1]).classList.add('placed');
        }
    }

    walls = game.getPlayerWalls('other');
    if (LOG) console.log('walls', walls);
    for (let i = 0; i < walls.length; i++) {
        let wall = walls[i];
        // si le mur est vertical
        if (wall[1] == 1) {
            document.getElementById('v-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('v-wall-' + wall[0][0] + '-' + (wall[0][1] - 1)).classList.add('placed');
        } else {
            // sinon le mur est horizontal
            document.getElementById('h-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('h-wall-' + (wall[0][0] - 0 + 1) + '-' + wall[0][1]).classList.add('placed');
        }
    }

    // add pawn(s)
    for (let y = BOARD_H; y > 0; y--) {
        for (let x = 1; x <= BOARD_W; x++) {
            if (game.board[x - 1][y - 1] == 1) {
                let cell = document.getElementById('cell-' + x + '-' + y);
                let player = document.createElement('div');
                player.classList.add('player', 'player-1');
                player.id = 'player-1';
                let img = document.createElement('img');
                img.src = 'resources/persons/titan_eren.png';
                img.alt = 'paw 1';
                img.classList.add('pawn-avatar');
                player.appendChild(img);
                cell.appendChild(player);
            } else if (game.board[x - 1][y - 1] == 2) {
                let cell = document.getElementById('cell-' + x + '-' + y);
                let player = document.createElement('div');
                player.classList.add('player', 'player-2');
                player.id = 'player-2';
                let img = document.createElement('img');
                img.src = 'resources/persons/humain_annie.png';
                img.alt = 'paw 2';
                img.classList.add('pawn-avatar');
                player.appendChild(img);
                cell.appendChild(player);
            }
        }
    }

    // update the fog of war
    updateFogOfWarFromBack(game.board);
}

// do not use this function, use local_board/init_board instead
export function display_initial_board(playerId, board) {
    if (LOG) console.log('display_initial_board');
    global_board = board;
    let BOARD_W = board.width();
    let BOARD_H = board.height();

    // reset the board
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let y = BOARD_H; y > 0; y--) {
        // for each row, create a line of cells and vertical walls
        for (let x = 1; x <= BOARD_W; x++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + x + '-' + y;
            if ((playerId === 1 && y === 1) || (playerId === 2 && y === BOARD_H)) {
                cell.addEventListener('click', placePlayer);
            }

            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let x = 1; x <= BOARD_W; x++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (1 < y && y <= BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the first or the last row and the last column
            if (1 < y && y <= BOARD_W && x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }
        }
    }
    document.documentElement.style.setProperty('--board-width', BOARD_W);

    // add the players profile
    for (let i = 1; i <= 2; i++) {
        // change the number of walls for the player
        let player_profile;
        if (i + 1 == board.getPlayer) {
            player_profile = document.getElementById('self_profile');
        } else {
            player_profile = document.getElementById('other_profile');
        }
        player_profile.getElementsByClassName('walls')[0].textContent = board.remainingWalls();

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        img.src = 'resources/persons/' + board.getPlayer(i).avatar + '.png';
    }

    // change the turn number
    let turn_number = document.getElementById('turn');
    turn_number.textContent = board.getTurnCount();
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

// display the board without any event listener
export function displayEndGame() {
    let game = getGame();
    if (LOG) console.log('displayEndGame', game);
    let board = game.board;
    let BOARD_W = board.length || 0;
    let BOARD_H = 0;
    if (board !== undefined && board.length > 0) {
        BOARD_H = board[0].length || 0;
    }

    // reset the board
    let board_div = document.getElementById('board');
    board_div.innerHTML = '';

    // create the cells and walls
    for (let y = BOARD_H; y > 0; y--) {
        // for each row, create a line of cells and vertical walls
        for (let x = 1; x <= BOARD_W; x++) {
            // create a cell and add it to the board
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell-' + x + '-' + y;
            board_div.appendChild(cell);

            // create a vertical wall and add it to the board
            // if this is not the last column
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('v-wall', 'wall');
                wall.id = 'v-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let x = 1; x <= BOARD_W; x++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (1 < y && y <= BOARD_H) {
                let wall = document.createElement('div');
                wall.classList.add('h-wall', 'wall');
                wall.id = 'h-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the first or the last row and the last column
            if (1 < y && y <= BOARD_W && x < BOARD_W) {
                let wall = document.createElement('div');
                wall.classList.add('s-wall', 'wall');
                wall.id = 's-wall-' + x + '-' + y;
                board_div.appendChild(wall);
            }
        }
    }
    document.documentElement.style.setProperty('--board-width', BOARD_W);

    // add the players profile
    for (let i = 1; i <= 2; i++) {
        // change the number of walls for the player
        let player_profile;
        if (i == game.getPlayer) {
            player_profile = document.getElementById('self_profile');
        } else {
            player_profile = document.getElementById('other_profile');
        }
        player_profile.getElementsByClassName('walls')[0].textContent = game.remainingWalls();

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        // img.src = 'resources/persons/' + game.getPlayer(i).avatar + '.png';
    }

    // change the turn number
    let turn_number = document.getElementById('turn');
    turn_number.textContent = game.getTurnCount();

    // add players walls
    let walls = game.getPlayerWalls('own');
    for (let i = 0; i < walls.length; i++) {
        let wall = walls[i];
        // si le mur est vertical
        if (wall[1] == 1) {
            document.getElementById('v-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('v-wall-' + wall[0][0] + '-' + (wall[0][1] - 1)).classList.add('placed');
        } else {
            // sinon le mur est horizontal
            document.getElementById('h-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('h-wall-' + (wall[0][0] - 0 + 1) + '-' + wall[0][1]).classList.add('placed');
        }
    }

    walls = game.getPlayerWalls('other');
    for (let i = 0; i < walls.length; i++) {
        let wall = walls[i];
        // si le mur est vertical
        if (wall[1] == 1) {
            document.getElementById('v-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('v-wall-' + wall[0][0] + '-' + (wall[0][1] - 1)).classList.add('placed');
        } else {
            // sinon le mur est horizontal
            document.getElementById('h-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('s-wall-' + wall[0][0] + '-' + wall[0][1]).classList.add('placed');
            document.getElementById('h-wall-' + (wall[0][0] - 0 + 1) + '-' + wall[0][1]).classList.add('placed');
        }
    }

    // add pawn(s)
    for (let y = BOARD_H; y > 0; y--) {
        for (let x = 1; x <= BOARD_W; x++) {
            if (game.board[x - 1][y - 1] == 1) {
                let cell = document.getElementById('cell-' + x + '-' + y);
                let player = document.createElement('div');
                player.classList.add('player', 'player-1');
                player.id = 'player-1';
                let img = document.createElement('img');
                img.src = 'resources/persons/titan_eren.png';
                img.alt = 'paw 1';
                img.classList.add('pawn-avatar');
                player.appendChild(img);
                cell.appendChild(player);
            } else if (game.board[x - 1][y - 1] == 2) {
                let cell = document.getElementById('cell-' + x + '-' + y);
                let player = document.createElement('div');
                player.classList.add('player', 'player-2');
                player.id = 'player-2';
                let img = document.createElement('img');
                img.src = 'resources/persons/humain_annie.png';
                img.alt = 'paw 2';
                img.classList.add('pawn-avatar');
                player.appendChild(img);
                cell.appendChild(player);
            }
        }
    }

    // update the fog of war
    updateFogOfWarFromBack(game.board);
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
    if (LOG) {
        console.log('display_message', message);
    }
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

document.addEventListener('DOMContentLoaded', function () {
    // Get the current user's name and ELO from localStorage
    const username = localStorage.getItem('username');
    const userElo = localStorage.getItem('elo');

    // Set the current user's name and ELO in the HTML
    document.getElementById('self_pseudo').textContent = username;
    document.getElementById('self_elo').textContent = userElo;

    // Get the opponent's name and ELO from localStorage
    const opponentName = localStorage.getItem('opponentName');
    const opponentElo = localStorage.getItem('opponentElo');

    // Set the opponent's name and ELO in the HTML
    document.getElementById('other_pseudo').textContent = opponentName;
    document.getElementById('other_elo').textContent = opponentElo;

    newGame('player1', 'player2', true);
});
