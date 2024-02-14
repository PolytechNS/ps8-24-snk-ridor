import { getBoard, Board } from './board/board.js';
import { Position } from './board/position.js';
import {
    display_board,
    display_overviews,
    wall_over_display,
    wall_out_display,
    display_message,
    display_action_message,
} from './display.js';

/*
 * When a cell is clicked, check if there is a player on the cell
 * or if this is a possible move to trigger the right action
 * @param {Event} the click event
 * @return {void}
 * @side-effect: trigger the right action
 */
export function onCellClick(event) {
    let target;
    if (!event.target.classList.contains('wall')) {
        target = event.target.parentElement;
    } else {
        target = event.target;
    }

    let position = new Position(target.id.split('-')[2], target.id.split('-')[1]);

    let board = getBoard();
    // if the player 1 has not placed its pawn yet, we display the possible moves
    if (board.getPlayer(0).getPosition() == null) {

            placePawn(board.getPlayer(0), position);
            display_board(board);
            display_action_message("")
            display_message('Place the player 2 pawn on the first line', 1000);
            let overviews = [];
            for (let i = 0; i < board.getWidth(); i++) {
                let j = 0;
                overviews.push(new Position(i, j));
            }
            display_overviews(overviews);
            return;
    } else {
        console.log("position 1 : ", board.getPlayer(1).getPosition());
        // if the player 2 has not placed its pawn yet, we display the possible moves
        if (board.getPlayer(1).getPosition() == null) {

                placePawn(board.getPlayer(1), position);
                display_board(board);
                display_message('The game can start', 1000);
                display_overviews();
                return;
        }
        console.log("position 2 : ", board.getPlayer(1).getPosition());
    }

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
        let coordinate = convertCoordinatesFromId(position.x, position.y, vertical);
        position = new Position(coordinate[0], coordinate[1]);
        getBoard().placeWall(myPlayer(), coordinate);
        let wall_event = new Event('wall', myPlayer(), coordinate);
        send_event(wall_event);
        display_board(getBoard());
    }
}

export function send_event(event) {
    console.log("DoEvent : ", event);
    let board = getBoard();
    let retour = board.doEvent(event);
    console.log(retour);
}

export function onBoardInit() {
    display_board(getBoard());

    // display the overviews on the first line to let the player place its pawn
    let overviews = [];
    for (let i = 0; i < getBoard().getWidth(); i++) {
        let j = getBoard().getHeight() - 1;

        overviews.push(new Position(i, j));
    }
    display_overviews(overviews);
    display_action_message('Place the player 1 pawn on the first line');
    // TODO : change for multiplayer
}


/*
 * Let the player place it's pawn on the board for the first turn
 * @param {Position} the position of the pawn
 * @return {void}
 * @side-effect: change the position of the player
 */
export function placePawn(player, position) {
    if (player.getPosition() != null) {
        // raise an error
        throw new Error('The player has already placed its pawn');
    }
    player.setPosition(position);
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
    let board = getBoard();
    return board.getPlayer(0);
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
        if (board.getWalls()[position.x - 1][position.y] == 0) {
            // if there is no wall on the left
            // if there is no player on the left
            if (!isPlayerOnPosition(new Position(position.x - 1, position.y))) {
                positions.push(new Position(position.x - 1, position.y));
            } else {
                // if there is a player on the left check if there is no wall behind
                if (
                    position.x > 1 &&
                    board.getWalls()[position.x - 2][position.y] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x - 2, position.y));
                }
            }
        }
    }
    if (position.x < board.getSize()[0] - 1) {
        // if the player is not on the right border
        if (board.getWalls()[position.x + 1][position.y] == 0) {
            // if there is no wall on the right
            // if there is no player on the right
            if (!isPlayerOnPosition(new Position(position.x + 1, position.y))) {
                positions.push(new Position(position.x + 1, position.y));
            } else {
                // if there is a player on the right check if there is no wall behind
                if (
                    position.x < board.getSize()[1] - 2 &&
                    board.getWalls()[position.x + 2][position.y] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x + 2, position.y));
                }
            }
        }
    }
    if (position.y > 0) {
        // if the player is not on the top border
        if (board.getWalls()[position.x][position.y - 1] == 0) {
            // if there is no wall on the top
            // if there is no player on the top
            if (!isPlayerOnPosition(new Position(position.x, position.y - 1))) {
                positions.push(new Position(position.x, position.y - 1));
            } else {
                // if there is a player on the top check if there is no wall behind
                if (
                    position.y > 1 &&
                    board.getWalls()[position.x][position.y - 2] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y - 2));
                }
            }
        }
    }
    if (position.y < board.getSize()[1] - 1) {
        // if the player is not on the bottom border
        if (board.getWalls()[position.x][position.y + 1] == 0) {
            // if there is no wall on the bottom
            // if there is no player on the bottom
            if (!isPlayerOnPosition(new Position(position.x, position.y + 1))) {
                positions.push(new Position(position.x, position.y + 1));
            } else {
                // if there is a player on the bottom check if there is no wall behind
                if (
                    position.y < board.getSize()[0] - 2 &&
                    board.getWalls()[position.x][position.y + 2] == 0
                ) {
                    // if there is another player next to the first one, he can jump over
                    positions.push(new Position(position.x, position.y + 2));
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

/*
 * convert the coordinates of the board to the coordinates of the display
 * @param {int} the i coordinate of the board
 * @param {int} the j coordinate of the board
 * @return {int[]} the x and y coordinates of the display
 */
export function convertCoordinatesFromId(i, j, vertical) {
    let x;
    let y;
    if (vertical) {
        x = j;
        y = i * 2;
    } else {
        x = j - 1;
        y = i * 2 + 1;
    }
    return [x, y];
}

/*
 * convert the coordinates of the display to the coordinates of the board
 * @param {int} the x coordinate of the display
 * @param {int} the y coordinate of the display
 * @return {int[][]} the i and j coordinates of the board
 * @return {boolean} true if the wall is vertical, false if the wall is horizontal
 */
export function convertCoordinatesToId(x, y) {
    let vertical;
    let i1;
    let i2;
    let j1;
    let j2;

    j1 = x;
    if (y % 2 === 0) {
        vertical = true;
        i1 = y / 2;
        i2 = i1 + 1;
        j2 = j1;
    } else {
        vertical = false;
        i1 = (y - 1) / 2;
        i2 = i1;
        j2 = j1 + 1;
    }
    return [
        [i1, j1],
        [i2, j2],
        vertical,
    ];
}