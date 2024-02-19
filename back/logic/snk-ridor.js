/*
 * This function is called at the beginning of the game.
 * @param {int} AIplay - 1 if the AI is the first player, 2 if it's the second player.
 * @return {Promise(string)} - The placement of the player on the board.
 */
function setup(AIplay) {
    let column = Math.ceil(Math.random() * 9);

    if (AIplay === 1) {
        return new Promise((resolve, _) => {
            resolve(`${column}1`);
        });
    } else if (AIplay === 2) {
        return new Promise((resolve, _) => {
            resolve(`${column}9`);
        });
    } else {
        return new Promise((_, reject) => {
            reject('Invalid AIplay');
        });
    }
}

/*
 * This function is called at each turn of the game.
 * @param {object} GameState - The current state of the game.
 * @return {Promise(Move)} - The position of the player on the board.
 */
function nextMove(gameState) {
    gameState = GameState.fromDict(gameState);

    console.log('gameState', gameState);

    let player_position = gameState.getPlayer();

    console.log('player_position', player_position);

    x = parseInt(player_position[0]);
    y = parseInt(player_position[1]);

    let moves = [];

    if (x - 1 > 0 && y > 0 && x - 1 < 10 && y < 10) {
        moves.push(`${x - 1}${y}`);
    }

    if (x + 1 > 0 && y > 0 && x + 1 < 10 && y < 10) {
        moves.push(`${x + 1}${y}`);
    }

    if (x > 0 && y - 1 > 0 && x < 10 && y - 1 < 10) {
        moves.push(`${x}${y - 1}`);
    }

    if (x > 0 && y + 1 > 0 && x < 10 && y + 1 < 10) {
        moves.push(`${x}${y + 1}`);
    }

    if (moves.length === 0) {
        return new Move('idle', null);
    }

    let random = Math.floor(Math.random() * moves.length);

    return new Move('move', moves[random]);
}

/*
 * This function is called when the move we chose is impossible.
 * @param {Move} move - The move that was made instead of the one we chose.
 * @return {Promise(boolean)} - True to tell the game we are ready to continue playing. False shouldn't bre returned.
 */
function correction(move) {
    move = Move.fromDict(move);
}

/*
 * This function is called after your move to tell you the state of the game.
 * @param {GameState} gameState - The current state of the game.
 * @return {Promise(boolean)} - True to tell the game we are ready to continue playing. False shouldn't be returned.
 */
function updateBoard(gameState) {
    // Here, you can process the gameState if needed. For example:
    // Analyze the game board, check for winning conditions, update strategy, etc.
    // For now, we'll simply return true to indicate we're ready for the next move.

    return new Promise((resolve, _) => {
        resolve(true);
    });
}

class GameState {
    /*
     * @param {list(list(str, int))} opponentWalls - The walls of the opponent.
     * @param {list(list(str, int))} ownWalls - The walls of the player.
     * @param {list(list(int))} board - The board of the game (-1 for fow, 0 for empty, 1 for player 1, 2 for player 2).
     */
    constructor(opponentWalls, ownWalls, board) {
        this.opponentWalls = opponentWalls;
        this.ownWalls = ownWalls;
        this.board = board;
    }

    static fromDict(dict) {
        return new GameState(
            dict['opponentWalls'],
            dict['ownWalls'],
            dict['board']
        );
    }

    static fromBoard(board, player) {
        let opponentWalls = [];
        let ownWalls = [];
        let b = board.getFogOfWarForPlayer(player);

        // replace all true with 0 and false with -1
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < b[i].length; j++) {
                if (b[i][j] === true) {
                    b[i][j] = 0;
                } else {
                    b[i][j] = -1;
                }
            }
        }

        let position = board.getPlayer(player.getId() - 1).getPosition();
        b[position.getX()][position.getY()] = 1;

        let opponentPosition = board
            .getPlayer(player.getId() === 2 ? 0 : 1)
            .getPosition();
        if (opponentPosition) {
            if (b[opponentPosition.getX()][opponentPosition.getY()] === 0) {
                b[opponentPosition.getX()][opponentPosition.getY()] = 2;
            }
        }

        let bcopy = [];
        // Change coordinates
        for (let i = b.length - 1; i >= 0; i--) {
            bcopy.push(b[i]);
        }

        return new GameState(opponentWalls, ownWalls, bcopy);
    }

    getPlayer() {
        return this.findCell('1');
    }

    getOpponent() {
        return this.findCell('2');
    }

    findCell(searchedValue) {
        let x = 0;
        let y = 0;

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] === searchedValue) {
                    x = i;
                    y = j;
                }
            }
        }

        return `${parseInt(x) + 1}${parseInt(y) + 1}`;
    }
}

class Move {
    constructor(action, value) {
        if (!['move', 'wall', 'idle'].includes(action)) {
            throw new Error('Invalid action');
        }

        this.action = action;

        if (action === 'move') {
            // Check that the value is a string containing two digits.
            if (!/^\d\d$/.test(value)) {
                throw new Error(`Invalid value: ${value}`);
            }
        }

        if (action === 'wall') {
            // Check that the value is a list containing two elements
            // 1. a position string containing two digits
            // 2. a direction int (0 for horizontal, 1 for vertical)
            if (!Array.isArray(value) || value.length !== 2) {
                throw new Error('Invalid value');
            }

            if (!/^\d\d$/.test(value[0])) {
                throw new Error('Invalid value');
            }

            if (![0, 1].contains(value[1])) {
                throw new Error('Invalid value');
            }
        }
        this.value = value;
    }

    static fromDict(dict) {
        return new Move(dict['action'], dict['value']);
    }
}

module.exports = {
    setup,
    nextMove,
    correction,
    updateBoard,
    GameState,
};
