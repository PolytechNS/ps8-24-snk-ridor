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
    turncount: number;
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
    Logger.log('Setup');

    globalState = {
        firstPlayer: AIplay === 1,
        player: 1,
        opponent: 2,
        stateHistory: [],
        turncount: 0,
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
    globalState.turncount += 1;

    Logger.log(JSON.stringify(gameState));

    if (getPlayerCoordinates(gameState.board, globalState.opponent) === null && globalState.turncount > 5) {
        Logger.log('Opponent position not found, finding this motherfucker');
        let pos = guessPlayerPosition(gameState);
        Logger.log(`Opponent found at ${JSON.stringify(pos)}.`);
        gameState.board[pos[0]][pos[1]] = 2;
    }

    if (getPlayerCoordinates(gameState.board, globalState.opponent) !== null) {
        Logger.log('Opponent position found, placing a wall to fuck him up');
        if (gameState.ownWalls.length < 10) {
            Logger.log("We have ammunition left, let's gooooooo !!!!!!!");
            let wall = optimal_wall(gameState);

            Logger.log(`optimal_wall(gameState) = ${JSON.stringify(wall)}`);

            if (wall !== undefined && wall !== null) {
                return new Promise((resolve) => {
                    resolve(wall);
                });
            }
        }
    }

    return new Promise((resolve) => {
        resolve(optimal_move(gameState));
    });
}

function optimal_move(gameState: GameState): Action {
    let aStar = new AStar(gameState.board, true, globalState.firstPlayer, gameState.opponentWalls.concat(gameState.ownWalls));

    let path = aStar.search()[1];

    if (path === undefined) {
        throw new Error('No path found');
    }

    return { action: 'move', value: `${path[0] + 1}${path[1] + 1}` };
}

function optimal_wall(gameState: GameState): Action | undefined {
    let allWalls = gameState.opponentWalls.concat(gameState.ownWalls);
    let possibleWalls = getPossibleWallPositions(allWalls);

    let bestWall: [string, number] = possibleWalls[0];
    let diffNumMovesTillWin = getNumTurnsDiff(gameState.board, globalState.firstPlayer, allWalls);
    let diffNumMovesTillWinSave = diffNumMovesTillWin;

    Logger.log(`getNumTurnsDiff(gameState.board, globalState.firstPlayer, allWalls) = ${diffNumMovesTillWin}`);

    let w = [];

    for (let wall of possibleWalls) {
        let newWalls = allWalls.concat([wall]);
        let diff = getNumTurnsDiff(gameState.board, globalState.firstPlayer, newWalls);

        w.push({ wall, diff });

        // Maximize the difference
        if (diff < diffNumMovesTillWin) {
            diffNumMovesTillWin = diff;
            bestWall = wall;
        }
    }

    Logger.log(JSON.stringify(w));

    if (diffNumMovesTillWin >= -1) {
        return;
    }

    Logger.log(`Placing wall at ${bestWall[0]} with orientation ${bestWall[1]} will result in a difference of ${diffNumMovesTillWinSave} -> ${diffNumMovesTillWin}`);

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

function calculateFOW(gameState: GameState): number[][] {
    let vert_filter = [
        [0, 0],
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, -1],
        [0, -2],
        [1, -1],
    ];

    let horiz_filter = [
        [0, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 0],
        [1, 1],
        [2, 0],
        [1, -1],
    ];

    let base_board: number[][];

    if (globalState.firstPlayer) {
        base_board = [
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
        ];
    } else {
        base_board = [
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
            [-1, -1, -1, -1, 0, 0, 0, 0, 0],
        ];
    }

    for (let wall of gameState.opponentWalls.concat(gameState.ownWalls)) {
        let modifier: number;

        if (gameState.opponentWalls.includes(wall)) {
            modifier = -1;
        }

        if (gameState.ownWalls.includes(wall)) {
            modifier = 1;
        }

        for (let ownWall of gameState.ownWalls) {
            let fil: number[][];
            if (ownWall[1] === Direction.HORIZONTAL) {
                fil = horiz_filter;
            }

            if (ownWall[1] === Direction.VERTICAL) {
                fil = vert_filter;
            }

            for (let filter of fil) {
                let x = parseInt(ownWall[0][0]) + filter[0];
                let y = parseInt(ownWall[0][1]) + filter[1];

                if (x >= 0 && x < 9 && y >= 0 && y < 9) {
                    base_board[x][y] += modifier;
                }
            }
        }
    }

    // find player 1 position and apply a +1 all around
    let [x, y] = getPlayerCoordinates(gameState.board, 1);
    let filter = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ];

    for (let f of filter) {
        let x_ = x + f[0];
        let y_ = y + f[1];

        if (x_ >= 0 && x_ < 9 && y_ >= 0 && y_ < 9) {
            base_board[x_][y_] += 1;
        }
    }

    return base_board;
}

function guessPlayerPosition(gameState: GameState): [number, number] {
    // Guess the player position based on the FOW
    let fow = calculateFOW(gameState);
    let max = 0;
    let x = 0;
    let y = 0;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (fow[i][j] > max) {
                max = fow[i][j];
                x = i;
                y = j;
            }
        }
    }

    return [x, y];
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
            if (!((y > 0 && getWallAtCoordinates(this.walls, x + 1 - 1, y + 1, Direction.VERTICAL)) || (y < 8 && getWallAtCoordinates(this.walls, x + 1 - 1, y + 1 + 1, Direction.VERTICAL)))) {
                ret.push([x - 1, y]);
            }
        }

        // Right
        if (x < 8) {
            // prettier-ignore
            if (!((y > 0 && getWallAtCoordinates(this.walls, x + 1, y + 1, Direction.VERTICAL)) || (y < 8 && getWallAtCoordinates(this.walls, x + 1, y + 1 + 1, Direction.VERTICAL)))) {
                ret.push([x + 1, y]);
            }
        }

        // Up
        if (y < 8) {
            // prettier-ignore
            if (!((x > 0 && getWallAtCoordinates(this.walls, x + 1 - 1, y + 1 + 1, Direction.HORIZONTAL)) || (x < 8 && getWallAtCoordinates(this.walls, x + 1, y + 1 + 1, Direction.HORIZONTAL)))) {
                ret.push([x, y + 1]);
            }
        }

        // Down
        if (y > 0) {
            // prettier-ignore
            if (!((x > 0 && getWallAtCoordinates(this.walls, x + 1 - 1, y + 1, Direction.HORIZONTAL)) || (x < 8 && getWallAtCoordinates(this.walls, x + 1, y + 1, Direction.HORIZONTAL)))) {
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

        return path;
    }
}

// === END OF A* ===

export { setup, nextMove, correction, updateBoard, AStar, getWallAtCoordinates, getPossibleWallPositions, getNumberOfTurnsTillGoal, getNumTurnsDiff };
