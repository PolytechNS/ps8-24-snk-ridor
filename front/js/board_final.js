let board;

export function getBoard() {
    if (!board  || board === undefined) {
        board = new Board();
    }
    return board;
}


const Action = {
    INIT: 0,
    MOVE: 1,
    WALL: 2,
};

const GameState = {
    PENDING: 0,
    WON: 1,
    DRAW: 2,
    LAST_MOVE: 3,
};

export class Position {
    x;
    y;

    constructor(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    equals(position) {
        return this.x === position.x && this.y === position.y;
    }
}

export class Player {
    id;
    position;
    avatar;

    constructor(id = 0, avatar = null) {
        this.id = id;
        this.avatar = avatar;
    }

    getId() {
        return this.id;
    }

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        this.position = position;
    }
}

export class Board {
    players;
    walls; // list of int (0 or 1 or 2) representing no wall, wall placed by player 1, wall placed by player 2
    history; // list of Events
    gameState;

    constructor(x_size = 9, y_size = 9) {
        this.players = [new Player(1), new Player(2)];
        this.walls = Array(y_size).fill(
            Array((x_size - 1) * 2).fill(0)
        );
        this.history = [];
        this.gameState = GameState.PENDING;

        /* ======================== */
        this.placePlayer(this.players[0], new Position(0, 0));
        this.players[0].avatar = "titan_eren";
        this.placePlayer(this.players[1], new Position(x_size - 1, y_size - 1));
        this.players[1].avatar = "humain_annie";
        /* ======================== */
    }

    /*
     * @return {int[][]} the fog of war for the board
     */
    getFogOfWar() {
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
            row.map((cell, x) => (player.id === 1 ? cell >= 0 : cell <= 0))
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
        // TODO : check if the position is valid
        player.setPosition(position);
    }

    /*
     * @param {Player}
     * @param {Position} the wanted absolute position of the player
     * @return {Position} the new absolute position of the player
     */
    movePlayer(player, position) {
        // TODO : check if the position is valid
        player.setPosition(position);
    }

    /*
     * @param {Player}
     * @param {Position} the wanted absolute position of the wall
     * @return {Position} the new absolute position of the wall
     */
    placeWall(player, position) {
        // TODO : check if the position is valid
        this.walls[position.y][position.x] = player.id;
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
    checkEnd() {
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
        return (this.getSize()[1]) / 2 + 1;
        // each cell is 2 units wide, one for the horizontal wall and one for the vertical wall
    }

    toJson() {
        return JSON.stringify({});
    }

    fromJson() { }
}

export class Event {
    player;
    action;
    position;

    constructor(player, action, position) {
        this.player = player;
        this.action = action;
        this.position = position;
    }
}
