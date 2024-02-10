import { getBoard, Board, Position } from "./board_final.js";
import { display_overviews } from "./display.js";

export function onCellClick(event) {
    let cell = event.target;
    // if the event target is not a cell, it must be a child of a cell
    // so we get the parent cell (player or move display on the cell)
    if (!cell.classList.contains("cell")) {
        cell = cell.parentElement;
    }
    let position = new Position(cell.id.split("-")[1], cell.id.split("-")[2]);
    if (isPlayerOnPosition(position)) {
        display_overviews(getCorridorPossiblePositions(position));
    } else {
        if (isItMyTurn() && getCorridorPossiblePositions(myPlayer().getPosition()).contains(position)) {
            let move_event = new Event("move", myPlayer(), position);
            send_event(move_event);
        }
    }
}

export function onWallOver(event) {
    console.log("wall over");
}

export function onWallOut(event) {
    console.log("wall out");
}

export function onWallClick(event) {
    console.log("wall click");
}

export function onPlayerClick(event) {
    console.log("player click");
}

export function send_event(event) {
    console.log("event sent");
}

/*
 * Check if it is the turn of the player
 * @return {boolean} true if it is the turn of the player, false otherwise
 */
function isItMyTurn() {
    return true;
}

/*
 * Get the player
 * @return {Player} the player
 */
function myPlayer() {
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
    if (position.x > 0) { // if the player is not on the left border
        if (board.getWalls()[position.y][position.x - 1] == 0) { // if there is no wall on the left
            // if there is no player on the left
            if (!isPlayerOnPosition(new Position(position.x - 1, position.y))) {
                positions.push(new Position(position.x - 1, position.y));
            } else { // if there is a player on the left check if there is no wall behind
                if (position.x > 1 && board.getWalls()[position.y][position.x - 2] == 0) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x - 2, position.y));
                }
            }

        }
    }
    if (position.y < board.getSize()[0] - 1) { // if the player is not on the right border
        if (board.getWalls()[position.y + 1][position.x] == 0) { // if there is no wall on the right
            // if there is no player on the right
            if (!isPlayerOnPosition(new Position(position.x, position.y + 1))) {
                positions.push(new Position(position.x, position.y + 1));
            } else { // if there is a player on the right check if there is no wall behind
                if (position.x < board.getSize()[0] - 2 && board.getWalls()[position.y + 2][position.x] == 0) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y + 2));
                }
            }
        }
    }
    if (position.y > 0) { // if the player is not on the top border
        if (board.getWalls()[position.y - 1][position.x] == 0) { // if there is no wall on the top
            // if there is no player on the top
            if (!isPlayerOnPosition(new Position(position.x, position.y - 1))) {
                positions.push(new Position(position.x, position.y - 1));
            } else { // if there is a player on the top check if there is no wall behind
                if (position.y > 1 && board.getWalls()[position.y - 2][position.x] == 0) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y - 2));
                }
            }
        }
    }
    if (position.x < board.getSize()[1] - 1) { // if the player is not on the bottom border
        if (board.getWalls()[position.y][position.x + 1] == 0) { // if there is no wall on the bottom
            // if there is no player on the bottom
            if (!isPlayerOnPosition(new Position(position.x + 1, position.y))) {
                positions.push(new Position(position.x + 1, position.y));
            } else { // if there is a player on the bottom check if there is no wall behind
                if (position.y < board.getSize()[1] - 2 && board.getWalls()[position.y][position.x + 2] == 0) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x + 2, position.y));
                }
            }
        }
    }
    return positions;
}

function isPlayerOnPosition(position) {
    for (let i = 0; i < 2; i++) {
        if (position.equals(getBoard().getPlayer(i).getPosition())) {
            return true;
        }
    }
    return false;
}