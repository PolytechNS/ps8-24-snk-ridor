import { Board } from './board/board.js';
import {
    onCellClick,
    onWallClick,
    onWallOut,
    onWallOver,
    convertCoordinatesToId,
    convertCoordinatesFromId
} from './engine_final.js';

/*
 * Uses the board to display the game board
 * @param {Board} the board to display
 * @return {void}
 * @side-effect: display the board
 * @side-effect: add event listeners to the cells and walls
 */
export function display_board(board) {

    // change variabe in css
    document.documentElement.style.setProperty(
        '--number-of-row',
        board.getHeight()
    );
    let BOARD_W = board.getWidth();
    let BOARD_H = board.getHeight();

    console.log('display_board', board);
    console.log('display_board', BOARD_W);
    console.log('display_board', BOARD_H);

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
        console.log(walls);
        for (let i = 0; i < walls.length; i++) {
            for (let j = 0; j < walls[i].length; j++) {
                if (walls[i][j] != 0) {
                    let walls = convertCoordinatesToId(i, j);
                    for (let w = 0; w < 2; w++) {
                        // if walls[2] == true then it's a 'v' wall, else it's a 'h' wall
                        let id = `${(walls[w][2])?"v":"h"}-wall-${walls[w][0]}-${walls[w][1]}`
                        let wall = document.getElementById(id);
                        wall.classList.add('placed');
                    }

                    // set the small wall
                    let wall = document.getElementById(
                        's-wall-' + walls[0][0] + '-' + walls[0][1]
                    );
                    wall.classList.add('placed');
                }
            }
        }
    }

    // add the players to the board
    for (let i = 0; i < 2; i++) {
        // for the two players, create a player and add it to the board
        let position = board.getPlayer(i).getPosition();

        // if the player is not on the board yet, or hide by fog of war
        // do not display it
        if (position != null && position != undefined) {
            let player = document.createElement('div');
            player.classList.add('player', 'player-' + i);
            player.id = 'player-' + i;

            let img = document.createElement('img');
            img.src = 'resources/persons/' + board.getPlayer(i).avatar || "humain_annie" + '.png';
            img.alt = 'paw ' + i;
            img.classList.add('pawn-avatar');
            player.appendChild(img);

            let cell = document.getElementById(
                'cell-' + position.x + '-' + position.y
            );
            cell.appendChild(player);
        }

        // change the number of walls for the player
        console.log('player-' + (1 + i) + '-profile');
        let player_profile = document.getElementById(
            'player-' + (1 + i) + '-profile'
        );
        player_profile.getElementsByClassName('walls')[0].textContent = board
            .getPlayer(i)
            .remainingWalls();

        // change the profile picture
        let img = player_profile.getElementsByClassName('avatar')[0];
        img.src = 'resources/persons/' + board.getPlayer(i).avatar || "humain_annie" + '.png';
    }
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
    let board_div = document.getElementById('board');
    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let cell = document.getElementById(
            'cell-' + position.y + '-' + position.x
        );

        let overview = document.createElement('div');
        overview.classList.add('position_overview');
        cell.appendChild(overview);
    }
}

export function wall_over_display(positions, vertical = true) {
    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        console.log(
            (vertical ? 'v' : 'h') + '-wall-' + position.y + '-' + position.x
            )
        let wall = document.getElementById(
            (vertical ? 'v' : 'h') + '-wall-' + position.y + '-' + position.x
        );
        wall.classList.add('wall-over');
    }
    // add the small wall to made the junction
    document
        .getElementById('s-wall-' + positions[0].y + '-' + positions[0].x)
        .classList.add('wall-over');
}

export function wall_out_display(positions, vertical = true) {
    for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let wall = document.getElementById(
            (vertical ? 'v' : 'h') + '-wall-' + position.y + '-' + position.x
        );
        wall.classList.remove('wall-over');
    }
    // remove the small wall that made the junction
    document
        .getElementById('s-wall-' + positions[0].y + '-' + positions[0].x)
        .classList.remove('wall-over');
}

document.addEventListener('DOMContentLoaded', function () {
    let board = new Board();
    display_board(board);
});
