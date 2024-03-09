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
    firstPlayer: boolean;
    player?: number;
    opponent?: number;
    stateHistory?: GameState[];
}

enum Direction {
    HORIZONTAL = 0,
    VERTICAL = 1,
}

class Logger {
    server: string = 'https://logs.ozeliurs.com';
    session: string;

    constructor() {
        this.session = Math.random().toString(36).substring(7);
    }

    _log(message: string) {
        const { exec, spawn } = require('child_process');

        let data = JSON.stringify({ message: message, timestamp: new Date().getTime() });

        exec('curl -X POST -H "Content-Type: application/json" -d \'' + data + "' " + this.server + '/log/' + this.session);
        // spawn('curl', ['-X', 'POST', '-H', 'Content-Type: application/json', '-d', data, this.server + '/log/' + this.session]);
    }

    static log(message: string) {
        console.log(new Date().getTime(), message);
        if (logger !== undefined) {
            logger._log(message);
        }
    }
}

let globalState: State;
let logger: Logger;

// === START OF AI ===

function setup(AIplay: number): Promise<string> {
    // logger = new Logger();

    globalState = {
        firstPlayer: AIplay === 1,
        player: 1,
        opponent: 2,
        stateHistory: [],
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

    Logger.log(`Game state: ${JSON.stringify(gameState)}`);

    if (getPlayerCoordinates(gameState.board, globalState.opponent) !== null) {
        let wall = optimal_wall(gameState);

        if (wall !== undefined && wall !== null) {
            return new Promise((resolve) => {
                Logger.log(`Wall: ${JSON.stringify(wall)}`);
                resolve(wall);
            });
        }
    }

    return new Promise((resolve) => {
        Logger.log('Optimal move');
        resolve(optimal_move(gameState));
    });
}

function optimal_move(gameState: GameState): Action {
    let aStar = new AStar(gameState.board, true, globalState.firstPlayer, gameState.opponentWalls.concat(gameState.ownWalls));

    let path = aStar.search()[1];

    if (path === undefined) {
        throw new Error('No path found');
    }

    Logger.log(`Move: ${path[0] + 1}${path[1] + 1}`);

    return { action: 'move', value: `${path[0] + 1}${path[1] + 1}` };
}

function optimal_wall(gameState: GameState): Action | undefined {
    let allWalls = gameState.opponentWalls.concat(gameState.ownWalls);
    let possibleWalls = getPossibleWallPositions(allWalls);

    let bestWall: [string, number] = possibleWalls[0];
    let diffNumMovesTillWin = getNumTurnsDiff(gameState.board, globalState.firstPlayer, allWalls);

    for (let wall of possibleWalls) {
        let newWalls = allWalls.concat([wall]);
        let diff = getNumTurnsDiff(gameState.board, globalState.firstPlayer, newWalls);

        if (diffNumMovesTillWin < diff) {
            diffNumMovesTillWin = diff;
            bestWall = wall;
        }
    }

    if (diffNumMovesTillWin <= 1) {
        return;
    }

    return { action: 'wall', value: bestWall };
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
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
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

    for (let x = 1; x < 9; x++) {
        for (let y = 2; y < 10; y++) {
            if (!(getWallAtCoordinates(walls, x, y, Direction.HORIZONTAL) || getWallAtCoordinates(walls, x - 1, y, Direction.HORIZONTAL) || getWallAtCoordinates(walls, x, y, Direction.VERTICAL))) {
                possibleWalls.push([`${x}${y}`, Direction.HORIZONTAL]);
            }
            if (!(getWallAtCoordinates(walls, x, y, Direction.VERTICAL) || getWallAtCoordinates(walls, x, y - 1, Direction.VERTICAL) || getWallAtCoordinates(walls, x, y, Direction.HORIZONTAL))) {
                possibleWalls.push([`${x}${y}`, Direction.VERTICAL]);
            }
        }
    }

    return possibleWalls;
}

function getNumberOfTurnsTillGoal(board: number[][], me: boolean, firstPlayer: boolean, walls: [string, number][]): number {
    let aStar = new AStar(board, me, firstPlayer, walls);
    let path = aStar.search();

    return path.length - 1;
}

function getNumTurnsDiff(board: number[][], firstPlayer: boolean, walls: [string, number][]): number {
    // return 0 if player 1 and 2 are at the same amount of turns to goal
    // return -x if the player 2 is x turns closer to the goal
    // return x if the player 1 is x turns closer to the goal
    return getNumberOfTurnsTillGoal(board, true, firstPlayer, walls) - getNumberOfTurnsTillGoal(board, false, !firstPlayer, walls);
}

// === A* ===

class AStar {
    readonly board: number[][];
    readonly walls: [string, number][];
    readonly goals: [number, number][]; // [x, y]
    readonly start: [number, number]; // [x, y]

    constructor(board: number[][], me: boolean, firstPlayer: boolean, walls: [string, number][]) {
        this.board = board;
        this.walls = walls;

        this.start = getPlayerCoordinates(board, me ? 1 : 2);
        Logger.log(`Start: ${JSON.stringify(this.start)}`);

        if (this.start === null) {
            throw new Error('AStar: Start position not found!');
        }

        if (firstPlayer) {
            this.goals = [[0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8]]; // prettier-ignore
        } else {
            this.goals = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]]; // prettier-ignore
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
        if (x > 0) {
            // prettier-ignore
            if (
                !(
                    y > 0 && getWallAtCoordinates(this.walls, (x+1) - 1, y, Direction.VERTICAL) ||
                    y < 8 && getWallAtCoordinates(this.walls, (x+1) - 1, y + 1, Direction.VERTICAL)
                )
            ) {
                ret.push([x - 1, y]);
            }
        }

        // Right
        if (x < 8) {
            // prettier-ignore
            if (
                !(
                    y > 0 && getWallAtCoordinates(this.walls, (x+1), y, Direction.VERTICAL) ||
                    y < 8 && getWallAtCoordinates(this.walls, (x+1), y + 1, Direction.VERTICAL)
                )
            ) {
                ret.push([x + 1, y]);
            }
        }

        // Up
        if (y < 8) {
            // prettier-ignore
            if (
                !(
                    x > 0 && getWallAtCoordinates(this.walls, (x+1) - 1, y + 1, Direction.HORIZONTAL) ||
                    x < 8 && getWallAtCoordinates(this.walls, (x+1), y + 1, Direction.HORIZONTAL)
                )
            ) {
                ret.push([x, y + 1]);
            }
        }

        // Down
        if (y > 0) {
            // prettier-ignore
            if (
                !(
                    x > 0 && getWallAtCoordinates(this.walls, (x+1) - 1, y, Direction.HORIZONTAL) ||
                    x < 8 && getWallAtCoordinates(this.walls, (x+1), y, Direction.HORIZONTAL)
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

        let recur_depth = 0;

        while (cameFrom[currentStr]) {
            current = cameFrom[currentStr];
            currentStr = `${current[0]}${current[1]}`;
            totalPath.push(current);

            if (currentStr === `${this.start[0]}${this.start[1]}`) {
                break;
            }
        }

        let path = totalPath.reverse();
        Logger.log(`Reconstructed path: ${JSON.stringify(path)}`);

        return path;
    }
}

// === END OF A* ===

export { setup, nextMove, correction, updateBoard, AStar, getWallAtCoordinates, getPossibleWallPositions, getNumberOfTurnsTillGoal };
