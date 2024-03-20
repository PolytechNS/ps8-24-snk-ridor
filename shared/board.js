export class Board {
    constructor(local_multiplayer = false) {
        this.board = JSON.parse(
            JSON.stringify(
                Array(9)
                    .fill()
                    .map(() => Array(9).fill(0))
            )
        );
        this.ownWalls = [];
        this.opponentWalls = [];
        this.player = 1;
    }

    height() {
        return this.board[0].length;
    }

    width() {
        return this.board.length;
    }

    getCellAt(x, y) {
        if (x > this.height || y > this.width || x < 1 || y < 1) {
            throw new Error(`invalid cell coordinates ${x}, ${y}`);
        }
        return this.board[x - 1][y - 1];
    }

    getWallAt(x, y, r) {
        if (x < 1 || x > this.width() + 1 || y < 1 || y > this.height() + 1 || ![0, 1].includes(r)) {
            throw new Error(`Invalid wall position: ${x}, ${y}, ${r}`);
        }

        // If horiz wall
        if (r === 0) {
            // If x = 1, then there is no wall to the left to check for
            if (x !== 1) {
                for (let i = 0; i < this.ownWalls.length; i++) {
                    if (this.ownWalls[i][0] === `${x - 1}${y}` && this.ownWalls[i][1] === r) {
                        return 1;
                    }

                    if (this.opponentWalls[i][0] === `${x - 1}${y}` && this.opponentWalls[i][1] === r) {
                        return 2;
                    }
                }
            }

            if (x !== this.width()) {
                for (let i = 0; i < this.ownWalls.length; i++) {
                    if (this.ownWalls[i][0] === `${x}${y}` && this.ownWalls[i][1] === r) {
                        return 1;
                    }

                    if (this.opponentWalls[i][0] === `${x}${y}` && this.opponentWalls[i][1] === r) {
                        return 2;
                    }
                }
            }
        }

        // If vert wall
        if (r === 1) {
            if (y !== 1) {
                for (let i = 0; i < this.ownWalls.length; i++) {
                    if (this.ownWalls[i][0] === `${x}${y - 1}` && this.ownWalls[i][1] === r) {
                        return 1;
                    }

                    if (this.opponentWalls[i][0] === `${x}${y - 1}` && this.opponentWalls[i][1] === r) {
                        return 2;
                    }
                }
            }

            if (y !== this.height()) {
                for (let i = 0; i < this.ownWalls.length; i++) {
                    if (this.ownWalls[i][0] === `${x}${y}` && this.ownWalls[i][1] === r) {
                        return 1;
                    }

                    if (this.opponentWalls[i][0] === `${x}${y}` && this.opponentWalls[i][1] === r) {
                        return 2;
                    }
                }
            }
        }
        return 0;
    }

    isWallAt(x, y, r) {
        if (x < 1 || x > this.width() || y < 1 || y > this.height() || ![0, 1].includes(r)) {
            throw new Error(`Invalid wall position: ${x}, ${y}, ${r}`);
        }
        return this.getWallAt(x, y, r) !== 0;
    }

    getPlayerPosition(playerId) {
        for (let y = 1; y <= this.height(); y++) {
            for (let x = 1; x <= this.width(); x++) {
                if (this.getCellAt(x, y) === playerId) {
                    return [x, y];
                }
            }
        }
        return [null, null];
    }

    placePlayer(playerId, x, y) {
        /*
         * Place a player on the board
         * @param {int} playerId - the id of the player to place
         * @param {int} x - the x coordinate of the player
         * @param {int} y - the y coordinate of the player
         * @throws {Error} - if the placement is invalid
         * @returns {void}
         */
        this.player = playerId;
        if (![1, 2].includes(playerId)) {
            throw new Error(`Invalid player id: ${playerId}`);
        }
        if (x < 1 || x > this.width() || y < 1 || y > this.height()) {
            throw new Error(`Player position out of board: ${x}, ${y}, ${playerId}`);
        }

        // if the player is already placed
        if (this.getPlayerPosition(playerId)[0] !== null) {
            throw new Error(`Player already placed: ${x}, ${y}, ${playerId}`);
        }

        if (this.player === 1) {
            if (y !== 1) {
                // le player 1 doit être placé sur la ligne
                throw new Error(`Invalid player position: ${x}, ${y}, ${playerId}`);
            }
        } else if (this.player === 2) {
            if (y !== 9) {
                // le player 2 doit être placé sur la ligne 9
                throw new Error(`Invalid player position: ${x}, ${y}, ${playerId}`);
            }
        }
        // place the player
        this.board[x - 1][y - 1] = playerId;
    }

    movePlayer(playerId, x, y) {
        /*
         * Move a player to a new position (for initial placement, use placePlayer instead)
         * @param {int} playerId - the id of the player to move
         * @param {int} x - the x coordinate of the player
         * @param {int} y - the y coordinate of the player
         * @throws {Error} - if the move is invalid
         * @returns {void}
         */
        console.log('movePlayer', playerId, x, y);
        if (x < 1 || x > this.width() || y < 1 || y > this.height() || ![1, 2].includes(playerId)) {
            throw new Error(`Invalid player move: ${x}, ${y}, ${playerId}`);
        }
    }

    /*
     * @param {playerId} the id of the player placing the wall
     * @param {x} the x coordinate of the wall
     * @param {y} the y coordinate of the wall
     * @param {r} the orientation of the wall (0 for horizontal, 1 for vertical)
     * @return {boolean} true if the wall is possible, false otherwise
     */
    placeWall(playerId, x, y, r) {
        this.player = playerId;
        //Check if the player is on the board
        if (this.getPlayerPosition(this.player)[0] === null) {
            throw new Error('Player not placed');
        }

        if (x < 1 || x > this.width() || y < 1 || y > this.height() || ![0, 1].includes(r) || ![1, 2].includes(playerId)) {
            throw new Error(`Invalid place wall: ${x}, ${y}, ${r}, ${playerId}`);
        }

        // Check if the wall is possible
        if (!this.isWallPossibleAt(x, y, r)) return false;

        // Place the wall
        if (this.player === 1) {
            this.ownWalls.push([`${x}${y}`, r]);
        } else {
            this.opponentWalls.push([`${x}${y}`, r]);
        }

        return true;
    }

    isWallPossibleAt(x, y, r) {
        if (x < 1 || x >= this.width() || y < 1 || y >= this.height() || ![0, 1].includes(r)) {
            throw new Error(`Invalid wall position: ${x}, ${y}, ${r}`);
        }

        if (r === 0) {
            // mur horizontal
            if (this.isWallAt(x, y, 0) || this.isWallAt(x, y, 1) || this.isWallAt(x + 1, y, 0) || this.isWallAt(x - 1, y, 0)) {
                return false;
            }
        } else {
            //mur vertical
            if (this.isWallAt(x, y, 0) || this.isWallAt(x, y, 1) || this.isWallAt(x, y + 1, 1) || this.isWallAt(x, y - 1, 1)) {
                return false;
            }
        }

        // Check if the wall is blocking the path
        if (!findPath(this, this.player)) {
            return false;
        }

        return true;
    }

    getWalls() {
        return this.ownWalls;
    }

    getPlayer() {
        return this.player;
    }
}

class GameState {
    /*
     * @param {list(list(str, int))} opponentWalls - a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
     * @param {list(list(str, int))} ownWalls - a list containing each of your walls (the same way opponentWalls are defined).
     * @param {list(list(int))} board - a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell is an integer : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
     */
    constructor(opponentWalls, ownWalls, board) {
        this.opponentWalls = opponentWalls;
        this.ownWalls = ownWalls;
        this.board = board;
    }

    static fromDict(dict) {
        return new GameState(dict['opponentWalls'], dict['ownWalls'], dict['board']);
    }

    static fromBoard(board, player) {
        let opponentWalls = [];
        let ownWalls = [];
        let b = board.getFogOfWarForPlayer(player);
    }

    //         // replace all true with 0 and false with -1
    //         for (let i = 0; i < b.length; i++) {
    //             for (let j = 0; j < b[i].length; j++) {
    //                 if (b[i][j] === true) {
    //                     b[i][j] = 0;
    //                 } else {
    //                     b[i][j] = -1;
    //                 }
    //             }
    //         }
    //
    //         let position = board.getPlayer(player.getId() - 1).getPosition();
    //         b[position.getX()][position.getY()] = 1;
    //
    //         let opponentPosition = board
    //             .getPlayer(player.getId() === 2 ? 0 : 1)
    //             .getPosition();
    //         if (opponentPosition) {
    //             if (b[opponentPosition.getX()][opponentPosition.getY()] === 0) {
    //                 b[opponentPosition.getX()][opponentPosition.getY()] = 2;
    //             }
    //         }
    //
    //         let bcopy = [];
    //         // Change coordinates
    //         for (let i = b.length - 1; i >= 0; i--) {
    //             bcopy.push(b[i]);
    //         }
    //
    //         return new GameState(opponentWalls, ownWalls, bcopy);
    //     }
    //
    //     getPlayer() {
    //         return this.findCell('1');
    //     }
    //
    //     isOpponentVisible() {
    //         for (let i = 0; i < this.board.length; i++) {
    //             for (let j = 0; j < this.board[i].length; j++) {
    //                 if (this.board[i][j] === 2) {
    //                     return true;
    //                 }
    //             }
    //         }
    //         return false;
    //     }
    //
    //     findCell(searchedValue) {
    //         let x = 0;
    //         let y = 0;
    //
    //         for (let i = 0; i < this.board.length; i++) {
    //             for (let j = 0; j < this.board[i].length; j++) {
    //                 if (this.board[i][j] === searchedValue) {
    //                     x = i;
    //                     y = j;
    //                 }
    //             }
    //         }
    //
    //         return `${parseInt(x) + 1}${parseInt(y) + 1}`;
    //     }
}

// Export Board for the frontend and the backend
/*
(function (exports) {
    exports.Board = new Board();
})(typeof exports === 'undefined' ? (this.share = {}) : exports);
*/
