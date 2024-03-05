interface GameState {
    board: number[][];
    opponentWalls: [string, number][];
    ownWalls: [string, number][];
}

interface Action {
    action: string;
    value: string | [string, number];
}

class State {
    player?: number;
    opponent?: number;
    stateHistory?: GameState[];
}

enum Direction {
    HORIZONTAL = 0,
    VERTICAL = 1,
}

let globalState: State;

// === START OF AI ===

function setup(AIplay: number): Promise<string> {
    globalState = {
        player: AIplay,
        opponent: AIplay === 1 ? 2 : 1,
    };

    let column = Math.ceil(Math.random() * 9);
    let line: number;

    if (AIplay === 1) {
        line = 1;
    } else {
        line = 9;
    }

    return new Promise((resolve) => {
        resolve(`${column}${line}`);
    });
}

function nextMove(gameState: GameState): Promise<Action> {
    globalState.stateHistory.push(gameState);

    let allWalls = gameState.ownWalls.concat(gameState.opponentWalls);

    // If you do not see the other player's pawn, move towards the goal
    let opponentCoordinates = getPlayerCoordinates(gameState.board, globalState.opponent);

    if (opponentCoordinates === null) {
        let possibleMoves = getPossibleWallPositions(gameState.ownWalls);

        let maxNumberOfTurnsTillGoal = 0;
        let bestMove = '11';

        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 10; j++) {
                if (gameState.board[i][j] === globalState.player) {
                    let newNumberOfTurnsTillGoal = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls.concat([[`${i}${j}`, Direction.HORIZONTAL]]));

                    if (newNumberOfTurnsTillGoal > maxNumberOfTurnsTillGoal) {
                        maxNumberOfTurnsTillGoal = newNumberOfTurnsTillGoal;
                        bestMove = `${i}${j}`;
                    }
                }
            }
        }

        possibleMoves.forEach((move) => {
            let newNumberOfTurnsTillGoal = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls.concat([move]));

            if (newNumberOfTurnsTillGoal > maxNumberOfTurnsTillGoal) {
                maxNumberOfTurnsTillGoal = newNumberOfTurnsTillGoal;
                bestMove = move[0];
            }
        });

        return new Promise((resolve) => {
            resolve({ action: 'move', value: bestMove });
        });
    }

    // If you see the opponent's pawn, check who will win.
    let numberOfTurnsTillGoalForOpponent = getNumberOfTurnsTillGoal(gameState.board, globalState.opponent, allWalls);
    let numberOfTurnsTillGoalForPlayer = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls);

    if (numberOfTurnsTillGoalForOpponent < numberOfTurnsTillGoalForPlayer) {
        // find the best wall to place to block the opponent
        let possibleWalls = getPossibleWallPositions(gameState.ownWalls);

        let maxNumberOfTurnsTillGoalForOpponent = 0;
        let bestWall: [string, number] = possibleWalls[0];

        possibleWalls.forEach((wall) => {
            let newWalls = gameState.ownWalls.concat([wall]);
            let numberOfTurnsTillGoalForOpponent = getNumberOfTurnsTillGoal(gameState.board, globalState.opponent, newWalls);

            if (numberOfTurnsTillGoalForOpponent > maxNumberOfTurnsTillGoalForOpponent) {
                maxNumberOfTurnsTillGoalForOpponent = numberOfTurnsTillGoalForOpponent;
                bestWall = wall;
            }
        });

        // If the new wall is better than the current state, place it
        if (maxNumberOfTurnsTillGoalForOpponent > numberOfTurnsTillGoalForOpponent) {
            return new Promise((resolve) => {
                resolve({ action: 'placeWall', value: bestWall }); // TODO: ozeliurs verify action name
            });
        }
    }

    return new Promise((resolve) => {
        resolve({ action: 'move', value: '11' });
    });
}

function correction(move: Action): Promise<boolean> {
    return new Promise((resolve) => {
        resolve(true);
    });
}

function updateBoard(gameState: GameState): Promise<boolean> {
    globalState.stateHistory.push(gameState);

    return new Promise((resolve) => {
        resolve(true);
    });
}

// === END OF AI ===

function getPlayerCoordinates(board: number[][], player: number): [number, number] {
    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 10; j++) {
            if (board[i][j] === player) {
                return [i, j];
            }
        }
    }
    return null;
}

function getWallAtCoordinates(walls: [string, number][], x: number, y: number, orientation: number): [string, number] {
    for (let i = 0; i < walls.length; i++) {
        if (walls[i][0] === `${x}${y}` && walls[i][1] === orientation) {
            return walls[i];
        }
    }
}

function getPossibleWallPositions(walls: [string, number][]): [string, number][] {
    let possibleWalls: [string, number][] = [];

    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            if (i < 9 && j < 9) {
                if (!(getWallAtCoordinates(walls, i, j, Direction.HORIZONTAL) || getWallAtCoordinates(walls, i - 1, j, Direction.HORIZONTAL) || getWallAtCoordinates(walls, i, j, Direction.VERTICAL))) {
                    possibleWalls.push([`${i}${j}`, Direction.HORIZONTAL]);
                }
                if (!(getWallAtCoordinates(walls, i, j, Direction.VERTICAL) || getWallAtCoordinates(walls, i, j - 1, Direction.VERTICAL) || getWallAtCoordinates(walls, i, j, Direction.HORIZONTAL))) {
                    possibleWalls.push([`${i}${j}`, Direction.VERTICAL]);
                }
            }
        }
    }

    return possibleWalls;
}

function getNumberOfTurnsTillGoal(board: number[][], player: number, walls: [string, number][]): number {
    let astar = new AStar(board, player, walls);
    let path = astar.search();

    return path.length - 1;
}

// === A* ===

class AStar {
    readonly board: number[][];
    readonly player: number;
    readonly walls: [string, number][];
    readonly goals: [number, number][]; // [x, y]
    readonly start: [number, number]; // [x, y]

    constructor(board: number[][], player: number, walls: [string, number][]) {
        this.board = board;
        this.player = player;
        this.walls = walls;

        this.start = getPlayerCoordinates(board, player);

        if (player === 2) {
            this.goals = [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]; // prettier-ignore
        } else {
            this.goals = [[1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9]]; // prettier-ignore
        }
    }

    heuristic(a: [number, number], b: [number, number]): number {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    neighbors(node: [number, number]): [number, number][] {
        let ret: [number, number][] = [];
        let x = node[0];
        let y = node[1];

        // Left
        if (x > 1) {
            // prettier-ignore
            if (
                !(
                    y > 1 && getWallAtCoordinates(this.walls, x - 1, y, Direction.VERTICAL) ||
                    y < 9 && getWallAtCoordinates(this.walls, x - 1, y + 1, Direction.VERTICAL)
                )
            ) {
                ret.push([x - 1, y]);
            }
        }

        // Right
        if (x < 9) {
            // prettier-ignore
            if (
                !(
                    y > 1 && getWallAtCoordinates(this.walls, x, y, Direction.VERTICAL) ||
                    y < 9 && getWallAtCoordinates(this.walls, x, y + 1, Direction.VERTICAL)
                )
            ) {
                ret.push([x + 1, y]);
            }
        }

        // Up
        if (y < 9) {
            // prettier-ignore
            if (
                !(
                    x > 1 && getWallAtCoordinates(this.walls, x - 1, y + 1, Direction.HORIZONTAL) ||
                    x < 9 && getWallAtCoordinates(this.walls, x, y + 1, Direction.HORIZONTAL)
                )
            ) {
                ret.push([x, y + 1]);
            }
        }

        // Down
        if (y > 1) {
            // prettier-ignore
            if (
                !(
                    x > 1 && getWallAtCoordinates(this.walls, x - 1, y, Direction.HORIZONTAL) ||
                    x < 9 && getWallAtCoordinates(this.walls, x, y, Direction.HORIZONTAL)
                )
            ) {
                ret.push([x, y - 1]);
            }
        }

        return ret;
    }

    search(): [number, number][] {
        let openSet: [number, number][] = [this.start];
        let cameFrom: { [key: string]: [number, number] } = {};
        let gScore: { [key: string]: number } = {};
        let fScore: { [key: string]: number } = {};

        gScore[`${this.start[0]}${this.start[1]}`] = 0;
        fScore[`${this.start[0]}${this.start[1]}`] = this.heuristic(this.start, this.goals[0]);

        while (openSet.length > 0) {
            let current: [number, number] = openSet[0];
            let currentStr = `${current[0]}${current[1]}`;

            for (let i = 1; i < openSet.length; i++) {
                let openSetStr = `${openSet[i][0]}${openSet[i][1]}`;

                if (fScore[openSetStr] < fScore[currentStr]) {
                    current = openSet[i];
                    currentStr = openSetStr;
                }
            }

            if (this.goals.some((goal) => goal[0] === current[0] && goal[1] === current[1])) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet = openSet.filter((node) => node[0] !== current[0] || node[1] !== current[1]);

            for (let neighbor of this.neighbors(current)) {
                let neighborStr = `${neighbor[0]}${neighbor[1]}`;
                let tentativeGScore = gScore[currentStr] + 1;

                if (tentativeGScore < (gScore[neighborStr] || Infinity)) {
                    cameFrom[neighborStr] = current;
                    gScore[neighborStr] = tentativeGScore;
                    fScore[neighborStr] = gScore[neighborStr] + this.heuristic(neighbor, this.goals[0]);

                    if (!openSet.some((node) => node[0] === neighbor[0] && node[1] === neighbor[1])) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return [];
    }

    private reconstructPath(cameFrom: { [key: string]: [number, number] }, current: [number, number]): [number, number][] {
        let totalPath: [number, number][] = [current];
        let currentStr = `${current[0]}${current[1]}`;

        while (cameFrom[currentStr]) {
            current = cameFrom[currentStr];
            currentStr = `${current[0]}${current[1]}`;
            totalPath.push(current);
            if (currentStr === `${this.start[0]}${this.start[1]}`) {
                break;
            }
        }

        return totalPath.reverse();
    }
}

// === END OF A* ===

export { setup, nextMove, correction, updateBoard, AStar, getWallAtCoordinates, getPossibleWallPositions, getNumberOfTurnsTillGoal };
