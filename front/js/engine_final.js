import { getBoard, Board } from './board/board.js';
import { Position } from './board/position.js';
import {
    display_board,
    display_overviews,
    wall_over_display,
    wall_out_display,
} from './display.js';

/*
 * When a cell is clicked, check if there is a player on the cell
 * or if this is a possible move to trigger the right action
 * @param {Event} the click event
 * @return {void}
 * @side-effect: trigger the right action
 */
export function onCellClick(event) {
    let cell = event.target;
    // if the event target is not a cell, it must be a child of a cell
    // so we get the parent cell (player or move display on the cell)
    if (!cell.classList.contains('cell')) {
        cell = cell.parentElement;
    }
    let position = new Position(cell.id.split('-')[1], cell.id.split('-')[2]);
    if (isPlayerOnPosition(position)) {
        display_overviews(getCorridorPossiblePositions(position));
    } else {
        // if it is the turn of the player, we check if the position is a possible move
        // then we send the move event
        if (isItMyTurn()) {
            for (let p of getCorridorPossiblePositions(
                myPlayer().getPosition()
            )) {
                if (p.equals(position)) {
                    let move_event = new Event('move', myPlayer(), position);
                    send_event(move_event);

                    // change the position of the player
                    myPlayer().setPosition(position);
                    display_board(getBoard()); // update the board
                }
            }
        }
    }
}

/*
 * When a wall is hovered, display the walls affected by the event
 * @param {Event} the mouseover event
 * @return {void}
 * @side-effect: display the walls affected by the event
 */
export function onWallOver(event) {
    if (myPlayer().remainingWalls() > 0) {
        let position = new Position(
            event.target.id.split('-')[3],
            event.target.id.split('-')[2]
        );
        let vertical = event.target.classList.contains('v-wall');
        let walls = get_walls_for_dom(position, vertical);
        wall_over_display(walls, vertical);
    }
}

export function onWallOut(event) {
    if (myPlayer().remainingWalls() > 0) {
        let position = new Position(
            event.target.id.split('-')[3],
            event.target.id.split('-')[2]
        );
        let vertical = event.target.classList.contains('v-wall');
        let walls = get_walls_for_dom(position, vertical);
        wall_out_display(walls, vertical);
    }
}

export function onWallClick(event) {
    if (myPlayer().remainingWalls() > 0) {
        let position = new Position(
            event.target.id.split('-')[3],
            event.target.id.split('-')[2]
        );
        let vertical = event.target.classList.contains('v-wall');
        let walls = get_walls_for_board(position, vertical);
        console.log(walls);
        getBoard().placeWalls(myPlayer(), walls);
        let wall_event = new Event('wall', myPlayer(), walls);
        send_event(wall_event);
        display_board(getBoard());
    }
}

export function onPlayerClick(event) {
    console.log('player click');
}

export function send_event(event) {
    console.log('event sent');
}

/*
 * Check if it is the turn of the player
 * @return {boolean} true if it is the turn of the player, false otherwise
 */
function isItMyTurn() {
    // TODO : implement the function
    return true;
}

/*
 * Get the player
 * @return {Player} the player
 */
function myPlayer() {
    // TODO : implement the function
    return getBoard().getPlayer(0);
}

/*
 * Calculate all the possible moves for a player from a position
 * @param {position} the board to display
 * @return {Position[]} the possible moves
 */
export function getCorridorPossiblePositions(position) {
    let positions = [];
    let board = getBoard();
    if (position.x > 0) {
        // if the player is not on the left border
        if (board.getWalls()[position.y][position.x - 1] == 0) {
            // if there is no wall on the left
            // if there is no player on the left
            if (!isPlayerOnPosition(new Position(position.x - 1, position.y))) {
                positions.push(new Position(position.x - 1, position.y));
            } else {
                // if there is a player on the left check if there is no wall behind
                if (
                    position.x > 1 &&
                    board.getWalls()[position.y][position.x - 2] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x - 2, position.y));
                }
            }
        }
    }
    if (position.y < board.getSize()[0] - 1) {
        // if the player is not on the right border
        if (board.getWalls()[position.y + 1][position.x] == 0) {
            // if there is no wall on the right
            // if there is no player on the right
            if (!isPlayerOnPosition(new Position(position.x, position.y + 1))) {
                positions.push(new Position(position.x, position.y + 1));
            } else {
                // if there is a player on the right check if there is no wall behind
                if (
                    position.x < board.getSize()[0] - 2 &&
                    board.getWalls()[position.y + 2][position.x] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y + 2));
                }
            }
        }
    }
    if (position.y > 0) {
        // if the player is not on the top border
        if (board.getWalls()[position.y - 1][position.x] == 0) {
            // if there is no wall on the top
            // if there is no player on the top
            if (!isPlayerOnPosition(new Position(position.x, position.y - 1))) {
                positions.push(new Position(position.x, position.y - 1));
            } else {
                // if there is a player on the top check if there is no wall behind
                if (
                    position.y > 1 &&
                    board.getWalls()[position.y - 2][position.x] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y - 2));
                }
            }
        }
    }
    if (position.x < board.getSize()[1] - 1) {
        // if the player is not on the bottom border
        if (board.getWalls()[position.y][position.x + 1] == 0) {
            // if there is no wall on the bottom
            // if there is no player on the bottom
            if (!isPlayerOnPosition(new Position(position.x + 1, position.y))) {
                positions.push(new Position(position.x + 1, position.y));
            } else {
                // if there is a player on the bottom check if there is no wall behind
                if (
                    position.y < board.getSize()[1] - 2 &&
                    board.getWalls()[position.y][position.x + 2] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x + 2, position.y));
                }
            }
        }
    }
    return positions;
}

/*
 * Check if there is a player on a position
 * @param {Position} the position to check
 * @return {boolean} true if there is a player on the position, false otherwise
 */
function isPlayerOnPosition(position) {
    for (let i = 0; i < 2; i++) {
        if (position.equals(getBoard().getPlayer(i).getPosition())) {
            return true;
        }
    }
    return false;
}

/*
 * Get the walls affected by the event
 * @param {Position} the position of the wall
 * @param {boolean} true if the wall is vertical, false if the wall is horizontal
 * @return {Position[]} the walls affected by the event
 */
function get_walls_for_dom(position, vertical) {
    let walls = [];
    if (vertical) {
        if (position.y < getBoard().getSize()[0] - 1) {
            // if the wall is not on the bottom border of the board
            walls.push(new Position(position.x, position.y));
            walls.push(new Position(position.x, position.y + 1));
        } else {
            walls.push(new Position(position.x, position.y - 1));
            walls.push(new Position(position.x, position.y));
        }
    } else {
        if (position.x < getBoard().getSize()[1] / 2) {
            // if the wall is not on the right border of the board
            walls.push(new Position(position.x, position.y));
            walls.push(new Position(position.x + 1, position.y));
        } else {
            walls.push(new Position(position.x - 1, position.y));
            walls.push(new Position(position.x, position.y));
        }
    }
    return walls;
}

/*
 * Get the walls affected by the event
 * @param {Position} the position of the wall
 * @param {boolean} true if the wall is vertical, false if the wall is horizontal
 * @return {int[][]} position of the wall in the board
 */
function get_walls_for_board(position, vertical) {
    let walls = [];
    if (vertical) {
        if (position.y < getBoard().getSize()[0] - 1) {
            walls.push([position.x * 2 + 1, position.y]);
            walls.push([position.x * 2 + 1, position.y + 1]);
        } else {
            walls.push([position.x * 2 + 1, position.y - 1]);
            walls.push([position.x * 2 + 1, position.y]);
        }
    } else {
        if (position.x < getBoard().getSize()[1] / 2 - 1) {
            walls.push([position.x * 2, position.y]);
            walls.push([position.x * 2 + 2, position.y]);
        } else {
            walls.push([position.x * 2 - 1, position.y]);
            walls.push([position.x * 2 + 1, position.y]);
        }
    }
    return walls;
}
