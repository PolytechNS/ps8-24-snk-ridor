// Globals
let globalGameState;
let goal;
let wallsPlaced = 0;
const MAX_WALLS = 3; // Maximum number of walls to place before moving towards the goal

/*
 * This function is called at the beginning of the game.
 * @param {int} AIplay - 1 if the AI is the first player, 2 if it's the second player.
 * @return {Promise(string)} - The placement of the player on the board.
 */
function setup(AIplay) {
    let column = Math.ceil(Math.random() * 9);

    if (AIplay === 1) {
        goal = 9;
        return new Promise((resolve, _) => {
            resolve(`${column}1`);
        });
    } else if (AIplay === 2) {
        goal = 1;
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
    globalGameState = gameState;

    console.log(gameState.getPlayer());

    // Place a wall in a systematic way
    let wallPosition = calculateNextWallPosition(gameState);

    if (wallPosition !== null) {
        return new Move('wall', wallPosition); // 0 for horizontal wall
    } else {
        // If the opponent is visible, or we have placed enough walls, calculate the best move
        let pathFinder = new PathFinder(gameState, goal);
        let bestMove = pathFinder.getBestMove();

        if (bestMove !== null) {
            return new Move('move', `${bestMove[0] + 1}${bestMove[1] + 1}`);
        }

        return new Move('idle', null);
    }
}

function calculateNextWallPosition(gameState) {
    if (goal === 9) {
        if (
            !gameState.opponentWalls.some(
                (wall) => wall[0] === '28' && wall[1] === 1
            ) &&
            !gameState.ownWalls.some(
                (wall) => wall[0] === '28' && wall[1] === 1
            )
        ) {
            wallsPlaced++;
            return ['28', 1];
        } else if (
            !gameState.opponentWalls.some(
                (wall) => wall[0] === '78' && wall[1] === 1
            ) &&
            !gameState.ownWalls.some(
                (wall) => wall[0] === '78' && wall[1] === 1
            )
        ) {
            wallsPlaced++;
            return ['78', 1];
        }
    } else if (goal === 1) {
        if (
            !gameState.opponentWalls.some(
                (wall) => wall[0] === '32' && wall[1] === 1
            ) &&
            !gameState.ownWalls.some(
                (wall) => wall[0] === '32' && wall[1] === 1
            )
        ) {
            wallsPlaced++;
            return ['82', 1];
        } else if (
            !gameState.opponentWalls.some(
                (wall) => wall[0] === '72' && wall[1] === 1
            ) &&
            !gameState.ownWalls.some(
                (wall) => wall[0] === '72' && wall[1] === 1
            )
        ) {
            wallsPlaced++;
            return ['73', 1];
        }
    }

    // Try to block player

    return null;
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
    globalGameState = JSON.parse(JSON.stringify(globalGameState));

    return new Promise((resolve, _) => {
        resolve(true);
    });
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

    isOpponentVisible() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] === 2) {
                    return true;
                }
            }
        }
        return false;
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
                throw new Error(`Invalid position: ${value[0]}`);
            }

            if (![0, 1].includes(value[1])) {
                throw new Error(`Invalid direction: ${value[1]}`);
            }
        }
        this.value = value;
    }

    static fromDict(dict) {
        return new Move(dict['action'], dict['value']);
    }
}

class PathFinder {
    constructor(gameState, goal) {
        this.gameState = gameState;
        this.goal = goal;
        this.nodes = this.initializeNodes();
        this.startNode =
            this.nodes[this.gameState.getPlayer()[1]][
                this.gameState.getPlayer()[0]
            ];
        this.goalNodes = this.nodes[this.goal - 1];
    }
    initializeNodes() {
        const nodes = [];
        const { board } = this.gameState;
        for (let y = 0; y < board.length; y++) {
            const row = [];
            for (let x = 0; x < board[y].length; x++) {
                const isWall = board[y][x] === '1';
                row.push(new Node(x, y, isWall));
            }
            nodes.push(row);
        }
        return nodes;
    }

    nodeExistsInGoalNodes(node) {
        return this.goalNodes.some(
            (goalNode) => goalNode.x === node.x && goalNode.y === node.y
        );
    }

    calculatePath() {
        let openList = [];
        const closedList = [];
        const startNode = this.startNode;
        const goalNodes = this.goalNodes;

        openList.push(startNode);

        while (openList.length > 0) {
            const currentNode = openList.reduce((prev, curr) =>
                prev.f < curr.f ? prev : curr
            );

            if (this.nodeExistsInGoalNodes(currentNode)) {
                return this.retrieveShortestPath(currentNode);
            }

            openList = openList.filter((node) => node !== currentNode);
            closedList.push(currentNode);

            const neighbors = this.getNeighbors(currentNode);

            for (const neighbor of neighbors) {
                if (closedList.includes(neighbor) || neighbor.isWall) {
                    continue;
                }

                const tentativeGScore =
                    currentNode.g + this.calculateCost(currentNode, neighbor);

                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                } else if (tentativeGScore >= neighbor.g) {
                    continue;
                }

                neighbor.parent = currentNode;
                neighbor.g = tentativeGScore;
                neighbor.h = this.calculateCost(neighbor, goalNodes[0]); // Use the first goal node for heuristic calculation
                neighbor.f = neighbor.g + neighbor.h;
            }
        }

        return null;
    }

    getBestMove() {
        const path = this.calculatePath();

        if (path && path.length > 1) {
            // The next move is the second node in the path because the first node is the current position
            return [path[1].x, path[1].y];
        }

        // If there's no path or the path only contains the current position, return null
        return null;
    }

    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        for (const direction of directions) {
            const x = node.x + direction[0];
            const y = node.y + direction[1];

            if (
                x >= 0 &&
                x < this.nodes[0].length &&
                y >= 0 &&
                y < this.nodes.length
            ) {
                neighbors.push(this.nodes[y][x]);
            }
        }

        return neighbors;
    }

    calculateCost(nodeA, nodeB) {
        return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
    }

    retrieveShortestPath(goalNode) {
        const path = [];
        let currentNode = goalNode;

        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = currentNode.parent;
        }

        return path;
    }
}

class Node {
    constructor(x, y, isWall) {
        this.x = x;
        this.y = y;
        this.isWall = isWall;
        this.g = Infinity; // Cost from start to this node
        this.h = 0; // Heuristic cost from this node to goal
        this.f = Infinity; // Total cost (g + h)
        this.parent = null; // Parent node for path tracing
        this.visited = false; // Flag to check if the node has been visited
    }
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
