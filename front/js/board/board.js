import { Action } from './action.js';
import { GameState } from './gameState.js';

let board;

export function getBoard() {
    if (!board) {
        board = new Board();
    }
    return board;
}

// Conventions:
// - x is the horizontal axis
// - y is the vertical axis
// - (0, 0) is the top left corner

/*
 * Board class
 * Represents the game board
 * Contains the players, the walls, the history and the game state
 */
export class Board {
    players;
    walls; // list of int (0 or 1 or 2) representing no wall, wall placed by player 1, wall placed by player 2
    history; // list of Events
    gameState;

    constructor(x_size = 9, y_size = 9) {
        this.players = [new Player(1), new Player(2)];
        this.walls = create2DArray(x_size, y_size * 2 - 2);
        this.history = [];
        this.gameState = GameState.PENDING;

        /* ======================== */
        // TODO Remove this
        this.placePlayer(this.players[0], new Position(0, 0));
        this.players[0].avatar = 'titan_eren';
        this.placePlayer(this.players[1], new Position(x_size - 1, y_size - 1));
        this.players[1].avatar = 'humain_annie';
        /* ======================== */
    }

    /*
     * @return {int[][]} the fog of war for the board
     */
    getFogOfWar() {
        let fogOfWar = Array.from(
            { length: this.getSize()[0] },
            (_, rowIndex) => {
                return Array.from(
                    { length: this.getSize()[1] },
                    (_, colIndex) =>
                        rowIndex === Math.ceil(this.getSize()[0] / 2)
                            ? 0
                            : rowIndex < this.getSize()[0] / 2
                              ? 1
                              : -1
                );
            }
        );

        // Apply filter of each wall
        this.walls.forEach((row, rowIndex) => {
            row.forEach((wall, colIndex) => {
                let modifier = wall === 1 ? 1 : wall === 2 ? -1 : 0;

                // If colIndex is even, it's a vertical wall
                if (colIndex % 2 === 0) {
                    // Left cells
                    fogOfWar[rowIndex][colIndex / 2] += modifier * 2;
                    fogOfWar[rowIndex][colIndex / 2 + 1] += modifier * 2;
                    if (colIndex > 0) {
                        fogOfWar[rowIndex - 1][colIndex / 2] += modifier;
                        fogOfWar[rowIndex - 1][colIndex / 2 + 1] += modifier;
                    }

                    // Right cells
                    fogOfWar[rowIndex + 1][colIndex / 2] += modifier * 2;
                    fogOfWar[rowIndex + 1][colIndex / 2 + 1] += modifier * 2;
                    if (colIndex < this.getSize()[1] - 1) {
                        fogOfWar[rowIndex + 2][colIndex / 2] += modifier;
                        fogOfWar[rowIndex + 2][colIndex / 2 + 1] += modifier;
                    }
                } else {
                    // Else, it's a horizontal wall
                    // Top cells
                    fogOfWar[rowIndex][(colIndex - 1) / 2] += modifier * 2;
                    fogOfWar[rowIndex + 1][(colIndex - 1) / 2] += modifier * 2;
                    if (rowIndex > 0) {
                        fogOfWar[rowIndex][(colIndex - 1) / 2 - 1] += modifier;
                        fogOfWar[rowIndex + 1][(colIndex - 1) / 2 - 1] +=
                            modifier;
                    }

                    // Bottom cells
                    fogOfWar[rowIndex][(colIndex - 1) / 2 + 1] += modifier * 2;
                    fogOfWar[rowIndex + 1][(colIndex - 1) / 2 + 1] +=
                        modifier * 2;
                    if (rowIndex < this.getSize()[0] - 1) {
                        fogOfWar[rowIndex][(colIndex - 1) / 2 + 2] += modifier;
                        fogOfWar[rowIndex + 1][(colIndex - 1) / 2 + 2] +=
                            modifier;
                    }
                }
            });
        });

        // Apply filter of each player
        this.players.forEach((player) => {
            let modifier = player.getId() === 1 ? 1 : -1;
            let position = player.getPosition();
            fogOfWar[position.getY()][position.getX()] = modifier;

            if (position.getX() > 0) {
                fogOfWar[position.getY()][position.getX() - 1] += modifier;
            }
            if (position.getX() < this.getSize()[1] - 1) {
                fogOfWar[position.getY()][position.getX() + 1] += modifier;
            }
            if (position.getY() > 0) {
                fogOfWar[position.getY() - 1][position.getX()] += modifier;
            }
            if (position.getY() < this.getSize()[0] - 1) {
                fogOfWar[position.getY() + 1][position.getX()] += modifier;
            }
        });

        return null;
    }

    /*
     * Uses getFogOfWar to return the fog of war for a specific player
     * (for player 1, returns a 2D array with true for cells with a value greater than or equal to 0)
     * (for player 2, returns a 2D array with true for cells with a value lower or equal to 0)
     * @param {Player} player
     * @return {bool[][]} the fog of war for the player
     */
    getFogOfWarForPlayer(player) {
        return this.getFogOfWar().map((row, y) =>
            row.map((cell, x) => (player.getId() === 1 ? cell >= 0 : cell <= 0))
        );
    }

    /*
     * @param {Player}
     * @param {Position} the wanted absolute position of the player
     * change the position of the player
     * must be called at the beginning of the game
     * to let the player place his pawn
     */
    placePlayer(player, position) {
        // If both players already have a position, throw
        if (this.players[player.getId() - 1].getPosition()) {
            throw new Error('Player already placed');
        }

        // Check that the position is valid
        if (
            position.getX() < 0 ||
            position.getX() >= this.getSize()[0] ||
            position.getY() < 0 ||
            position.getY() >= this.getSize()[1]
        ) {
            throw new Error('Invalid position');
        }

        // If placing player 1, check that it is on the first row
        if (player.getId() === 1 && position.getY() !== 0) {
            throw new Error('Player 1 must be placed on the first row');
        }

        // If placing player 2, check that it is on the last row
        if (player.getId() === 2 && position.getY() !== this.getSize()[0] - 1) {
            throw new Error('Player 2 must be placed on the last row');
        }

        player.setPosition(position);
    }

    /*
     * @param {Player}
     * @param {Position} the wanted absolute position of the player
     * @return {Position} the new absolute position of the player
     */
    movePlayer(player, position) {
        // Check that the position is valid
        if (
            position.getX() < 0 ||
            position.getX() >= this.getSize()[0] ||
            position.getY() < 0 ||
            position.getY() >= this.getSize()[1]
        ) {
            throw new Error('Invalid position');
        }

        // Check that the position is in the available moves
        if (!this.getPossibleMoves(player).find((p) => p.equals(position))) {
            throw new Error('Invalid position');
        }

        player.setPosition(position);
    }

    /*
     * @param {Player}
     * @param {Position} the wanted absolute position of the wall
     * @side-effect change the walls of the board
     */
    placeWall(player, position) {
        this.walls[position.getX()][position.getY()] = player.getId();
    }

    /*
     * @param {int} the index of the player
     * @return {Player} the player
     */
    getPlayer(int) {
        return this.players[int];
    }

    /*
     * @return {int[2]} the size of the board
     */
    getSize() {
        return [this.walls.length, this.walls[0].length];
    }

    /*
     * @param {Player}
     * @return {Position[]} the possible moves for the player (in absolute position)
     * TODO: add support for when opponent is missing
     */
    getPossibleMoves(player) {
        // Only god and me know how this works, please don't touch ✋
        let position = player.getPosition();
        let opponent = this.players.find((p) => p.getId() !== player.getId());

        let available_positions = [];

        // Top walls
        if (
            position.getY() !== 0 && // if on the top row we can't go up
            (position.getX() === this.getSize()[0] - 1 ||
                this.walls[position.getX()][position.getY() * 2 - 1] === 0) && // OK
            (position.getX() === 0 ||
                this.walls[position.getX() - 1][position.getY() * 2 - 1] === 0) // OK
        ) {
            if (
                opponent.getPosition().getX() !== position.getX() &&
                opponent.getPosition().getY() !== position.getY() - 1
            ) {
                available_positions.push(
                    new Position(position.getX(), position.getY() - 1)
                );
            } else {
                if (
                    position.getY() !== 1 && // if on the second row we can't go up two cells
                    (position.getX() === this.getSize()[0] - 1 ||
                        this.walls[position.getX()][position.getY() * 2 - 3] ===
                            0) && // OK
                    (position.getX() === 0 ||
                        this.walls[position.getX() - 1][
                            position.getY() * 2 - 3
                        ] === 0) // OK
                ) {
                    available_positions.push(
                        new Position(position.getX(), position.getY() - 2)
                    );
                }
            }
        }

        // Right
        if (
            position.getX() !== this.getSize()[0] - 1 && // if on the right column we can't go right
            (position.getY() === this.getSize()[1] - 1 ||
                this.walls[position.getX()][position.getY() * 2] === 0) && // OK
            (position.getY() === 0 ||
                this.walls[position.getX()][position.getY() * 2 - 2] === 0) // OK
        ) {
            if (
                opponent.getPosition().getX() !== position.getX() + 1 &&
                opponent.getPosition().getY() !== position.getY()
            ) {
                available_positions.push(
                    new Position(position.getX() + 1, position.getY())
                );
            } else {
                if (
                    position.getX() !== this.getSize()[0] - 2 && // if on the second to last column we can't go right two cells
                    (position.getY() === this.getSize()[1] - 2 ||
                        this.walls[position.getX() + 1][position.getY() * 2] ===
                            0) && // OK
                    (position.getY() === 0 ||
                        this.walls[position.getX() + 1][
                            position.getY() * 2 - 2
                        ] === 0) // OK
                ) {
                    available_positions.push(
                        new Position(position.getX() + 2, position.getY())
                    );
                }
            }
        }

        // Bottom
        if (
            position.getY() !== this.getSize()[1] - 1 && // if on the bottom row we can't go down
            (position.getX() === this.getSize()[0] - 1 ||
                this.walls[position.getX()][position.getY() * 2 + 1] === 0) && // OK
            (position.getX() === 0 ||
                this.walls[position.getX() - 1][position.getY() * 2 + 1] === 0) // OK
        ) {
            if (
                opponent.getPosition().getX() !== position.getX() &&
                opponent.getPosition().getY() !== position.getY() + 1
            ) {
                available_positions.push(
                    new Position(position.getX(), position.getY() + 1)
                );
            } else {
                if (
                    position.getY() !== this.getSize()[1] - 2 && // if on the second to last row we can't go down two cells
                    (position.getX() === this.getSize()[0] - 1 ||
                        this.walls[position.getX()][position.getY() * 2 + 3] ===
                            0) && // OK
                    (position.getX() === 0 ||
                        this.walls[position.getX() - 1][
                            position.getY() * 2 + 3
                        ] === 0) // OK
                ) {
                    available_positions.push(
                        new Position(position.getX(), position.getY() + 2)
                    );
                }
            }
        }

        // Left
        if (
            position.getX() !== 0 && // if on the left column we can't go left
            (position.getY() === this.getSize()[1] - 1 ||
                this.walls[position.getX() - 1][position.getY() * 2] === 0) &&
            (position.getY() === 0 ||
                this.walls[position.getX() - 1][position.getY() * 2 - 2] === 0)
        ) {
            if (
                opponent.getPosition().getX() !== position.getX() - 1 &&
                opponent.getPosition().getY() !== position.getY()
            ) {
                available_positions.push(
                    new Position(position.getX() - 1, position.getY())
                );
            } else {
                if (
                    position.getX() !== 1 && // if on the second column we can't go left two cells
                    (position.getY() === this.getSize()[1] - 1 ||
                        this.walls[position.getX() - 2][position.getY() * 2] ===
                            0) && // OK
                    (position.getY() === 0 ||
                        this.walls[position.getX() - 2][
                            position.getY() * 2 - 2
                        ] === 0)
                ) {
                    available_positions.push(
                        new Position(position.getX() - 2, position.getY())
                    );
                }
            }
        }

        return available_positions;
    }

    /*
     * @return {int[][]} the walls of the board (0 for no wall, 1 for wall placed by player 1, 2 for wall placed by player 2)
     */
    getWalls() {
        return this.walls;
    }

    /*
     * @return {bool} true if the game is over
     */
    doEvent(event) {
        switch (event.action) {
            case Action.INIT:
                this.placePlayer(event.player, event.position);
                break;
            case Action.MOVE:
                this.movePlayer(event.player, event.position);
                break;
            case Action.WALL:
                this.placeWall(event.player, event.position);
                break;
        }
    }

    /*
     * Uses the history to return the current player
     * @return {Player} the current player
     */
    getCurrentPLayer() {
        return this.players[this.history.length % 2];
    }

    /*
     * Uses the board to update the game state:
     * - to finished if the game is over
     * - to draw if the game is a draw
     * - to last move if the game is won by the second player
     */
    updateState() {
        return null;
    }

    /*
     * Calculate the height of the board
     * @return {int} the height of the board
     */
    getHeight() {
        return this.getSize()[0] + 1;
    }

    /*
     * Calculate the width of the board
     * @return {int} the width of the board
     */
    getWidth() {
        return this.getSize()[1] / 2 + 1;
        // each cell is 2 units wide, one for the horizontal wall and one for the vertical wall
    }

    copy() {
        let b = new Board();
        b.players = this.players.map((p) => p.copy());
        b.walls = this.walls.map((row) => row.slice());
        b.history = this.history.map((e) => e.copy());
        b.gameState = this.gameState;
        return b;
    }

    toJson() {
        return JSON.stringify({});
    }

    fromJson() {}
}

// TODO move this to a utils file of remove it altogether
function create2DArray(x, y, fill = 0) {
    let arr = [];
    for (let i = 0; i < x; i++) {
        arr.push(Array(y).fill(fill));
    }
    return arr;
}
