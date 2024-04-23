import { BOARD_WIDTH, BOARD_HEIGHT, Event, getGame } from './online_models.js';
import { next_player, firstOnCellClick } from './online_engine.js';
import { LOG } from './online_main.js';
import { placeWall } from '../online-game.js';

export function init_board(board_div, board) {
    if (LOG) console.log('Initializing board');
    let game = getGame();
    if (board == null) {
        board = game.board;
    }
    if (board_div == undefined) {
        board_div = document.getElementById('board');
    }

    let BOARD_W = BOARD_WIDTH;
    let BOARD_H = BOARD_HEIGHT;

    // reset the board
    board_div.innerHTML = '';

    for (let y = BOARD_H; y > 0; y--) {
        for (let x = 1; x <= BOARD_W; x++) {
            // create cell
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            if (LOG) cell.textContent = `[${x}, ${y}]`;
            if ((y == 1 && game.getOnlinePlayer() == 1) || (y == BOARD_H && game.getOnlinePlayer() == 2 && !LOG)) {
                cell.classList.add('finish');
            }
            if ((y == 1 && game.getOnlinePlayer() == 1) || (y == BOARD_H && game.getOnlinePlayer() == 2)) {
                cell.addEventListener('click', firstOnCellClick);
            }

            board_div.appendChild(cell);

            // create vertical wall
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.className = 'v-wall wall';
                wall.id = `v-wall-${x}-${y}`;
                board_div.appendChild(wall);
            }
        }

        for (let x = 1; x <= BOARD_W; x++) {
            if (y > 1) {
                // create horizontal wall
                let wall = document.createElement('div');
                wall.className = 'h-wall wall';
                wall.id = `h-wall-${x}-${y}`;
                board_div.appendChild(wall);

                if (x < BOARD_W) {
                    // create small wall
                    let wall = document.createElement('div');
                    wall.className = 's-wall wall';
                    wall.id = `s-wall-${x}-${y}`;
                    board_div.appendChild(wall);
                }
            }
        }
    }
}

export function display_board_one_player(board_div, board) {
    if (LOG) console.log('Displaying board for one player');
    let BOARD_W = BOARD_WIDTH;
    let BOARD_H = BOARD_HEIGHT;

    // reset the board
    board_div.innerHTML = '';

    for (let y = BOARD_H; y > 0; y--) {
        for (let x = 1; x <= BOARD_W; x++) {
            // create cell
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            if (LOG) cell.textContent = `[${x}, ${y}]`;
            if ((y == 1 || y == BOARD_H) && !LOG) {
                cell.classList.add('finish');
            }

            board_div.appendChild(cell);

            // create vertical wall
            if (x < BOARD_W) {
                let wall = document.createElement('div');
                wall.className = 'v-wall wall';
                wall.id = `v-wall-${x}-${y}`;
                board_div.appendChild(wall);
            }
        }

        // create horizontal wall
        for (let x = 1; x <= BOARD_W; x++) {
            if (y > 1) {
                // create horizontal wall
                let wall = document.createElement('div');
                wall.className = 'h-wall wall';
                wall.id = `h-wall-${x}-${y}`;
                board_div.appendChild(wall);

                if (x < BOARD_W) {
                    // create small wall
                    let wall = document.createElement('div');
                    wall.className = 's-wall wall';
                    wall.id = `s-wall-${x}-${y}`;
                    board_div.appendChild(wall);
                }
            }
        }
    }
}

// display message and dismiss it after 4 seconds
export function display_message(message, category = 'dev_message', timeout = 4000) {
    if (LOG) {
        console.log(message);
    } else if (category == 'dev_message') {
        return;
    }
    if (category == 'final_message') {
        // si la partie est terminée, on ajoute event et on affiche le message de fin
        document.getElementById('reload').addEventListener('click', () => {
            window.location.reload();
        });
        document.getElementById('final_message').textContent = message;
        document.getElementById('final_div').style.display = 'block';
        return;
    }
    // if action_message, remove previous action_message
    if (category == 'action_message') {
        let action_message = document.querySelector('.action_message');
        if (action_message) {
            action_message.remove();
        }
    }
    if (message == '') return;
    let message_div = document.createElement('div');
    message_div.classList.add('alert');
    message_div.classList.add(category); // category can be "dev_message", "forbidden_message", "info_message" or "final_message"
    message_div.textContent = message;
    document.getElementById('game-infos').appendChild(message_div);

    // display message for number of miliseconds
    if (timeout === parseInt(timeout)) {
        setTimeout(() => {
            message_div.remove();
        }, timeout);
    }
}

// Callback functions for visuals only

export function on_wall_over(event) {
    let game = getGame();
    if (game.remainingWalls(game.getCurrentPlayer()) == 0) return;
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some((wall) => wall.classList.contains('placed'))) {
        return;
    }

    for (let wall of walls) {
        wall.classList.add('wall-hover');
    }
}

export function on_wall_out(event) {
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some((wall) => wall.classList.contains('placed'))) {
        return;
    }

    for (let wall of walls) {
        wall.classList.remove('wall-hover');
    }
}

export function on_wall_click(event) {
    if (LOG) console.log('Wall clicked', event);
    let game = getGame();
    let wall_player = getGame().getCurrentPlayer();
    if (game.remainingWalls(wall_player) == 0) {
        display_message("Vous n'avez plus de murs !", 'forbidden_message');
        return;
    }

    if (!isMyTurn()) {
        display_message("Ce n'est pas votre tour !", 'forbidden_message');
        return;
    }

    let wall = event.target;
    // trigger the socket event
    let retour = wall.id.split('-');
    placeWall(`${retour[2]}${retour[3]}`, retour[0] === 'v' ? 1 : 0);

    // update the remaining walls
    display_message(`il reste ${game.remainingWalls(wall_player)} murs`, 'dev_message');
    let wall_event = new Event('wall', wall_player, event.walls);
    next_player(wall_event);
}

// Helper functions

function get_walls(event) {
    // When hovering over a wall, it can be difficult to determine which walls are affected. Here lays the truth

    // If the event target is not a wall, return []
    if (!event.target.classList.contains('wall')) {
        return [];
    }

    let main_wall = event.target;

    // If we are hovering a small wall, we do nothing
    if (main_wall.classList.contains('s-wall')) {
        return [];
    }

    let x = parseInt(main_wall.id.split('-')[2]);
    let y = parseInt(main_wall.id.split('-')[3]);

    // If we are hovering a vertical wall
    if (main_wall.classList.contains('v-wall')) {
        // If there is a vertical wall below
        if (y > 1 && y <= BOARD_HEIGHT) {
            return [main_wall, document.getElementById(`s-wall-${x}-${y}`), document.getElementById(`v-wall-${x}-${y - 1}`)];
        } else if (y == 1) {
            return [main_wall, document.getElementById(`s-wall-${x}-${y + 1}`), document.getElementById(`v-wall-${x}-${y + 1}`)];
        }
    }

    // If we are hovering a horizontal wall
    if (main_wall.classList.contains('h-wall')) {
        // If there is a horizontal wall to the right
        if (x < BOARD_WIDTH) {
            return [main_wall, document.getElementById(`s-wall-${x}-${y}`), document.getElementById(`h-wall-${x + 1}-${y}`)];
        } else if (x == BOARD_WIDTH) {
            return [main_wall, document.getElementById(`s-wall-${x - 1}-${y}`), document.getElementById(`h-wall-${x - 1}-${y}`)];
        }
    }

    if (LOG) console.log('No walls found');
    return [];
}

function isMyTurn() {
    if (LOG) console.log(`isMyTurn() called`);
    let game = getGame();
    return game.getCurrentPlayer() == game.getOnlinePlayer();
}
