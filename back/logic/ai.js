/*
 * This function is called at the beginning of the game.
 * @param {int} AIplay - 1 if the AI is the first player, 2 if it's the second player.
 * @return {Promise(string)} - The placement of the player on the board.
 */
function setup(AIplay) {
    if (AIplay === 1) {
        return new move('move', '11');
    } else if (AIplay === 2) {
        return new move('move', '99');
    } else {
        throw new Error('Invalid AIplay');
    }
}

/*
 * This function is called at each turn of the game.
 * @param {object} gameState - The current state of the game.
 * @return {Promise(move)} - The position of the player on the board.
 */
function nextMove(gameState) {
    gameState = GameState.fromDict(gameState);

    let player_position = gameState.board.getPlayer();

    let random = Math.floor(Math.random() * 4);

    switch (random) {
        case 0:
            return new move(
                'move',
                `${player_position[0] - 1}${player_position[1]}`
            );
        case 1:
            return new move(
                'move',
                `${player_position[0] + 1}${player_position[1]}`
            );
        case 2:
            return new move(
                'move',
                `${player_position[0]}${player_position[1] - 1}`
            );
        case 3:
            return new move(
                'move',
                `${player_position[0]}${player_position[1] + 1}`
            );
    }
}

/*
 * This function is called when the move we chose is impossible.
 * @param {move} move - The move that was made instead of the one we chose.
 * @return {Promise(boolean)} - True to tell the game we are ready to continue playing. False shouldn't bre returned.
 */
function correction(move) {
    move = Move.fromDict(move);
}

/*
 * This function is called after your move to tell you the state of the game.
 * @param {object} gameState - The current state of the game.
 * @return {Promise(boolean)} - True to tell the game we are ready to continue playing. False shouldn't bre returned.
 */
function updateBoard(gameState) {}

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
        return new gameState(
            dict['opponentWalls'],
            dict['ownWalls'],
            dict['board']
        );
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

        return `${x}${y}`;
    }
}

class Move {
    constructor(action, value) {
        if (!['move', 'wall', 'idle'].contains(action)) {
            throw new Error('Invalid action');
        }

        this.action = action;

        if (action === 'move') {
            // Check that the value is a string containing two digits.
            if (!/^\d\d$/.test(value)) {
                throw new Error('Invalid value');
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

            this.value = value;
        }

        this.player = player;
        this.position = position;
    }

    static fromDict(dict) {
        return new move(dict['action'], dict['value']);
    }
}
