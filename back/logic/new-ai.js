'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getNumberOfTurnsTillGoal = exports.getPossibleWallPositions = exports.getWallAtCoordinates = exports.AStar = exports.updateBoard = exports.correction = exports.nextMove = exports.setup = void 0;
var State = /** @class */ (function () {
    function State() {}
    return State;
})();
var Direction;
(function (Direction) {
    Direction[(Direction['HORIZONTAL'] = 0)] = 'HORIZONTAL';
    Direction[(Direction['VERTICAL'] = 1)] = 'VERTICAL';
})(Direction || (Direction = {}));
var globalState;
// === START OF AI ===
function setup(AIplay) {
    globalState = {
        player: AIplay,
        opponent: AIplay === 1 ? 2 : 1,
    };
    var column = Math.ceil(Math.random() * 9);
    var line;
    if (AIplay === 1) {
        line = 1;
    } else {
        line = 9;
    }
    return new Promise(function (resolve) {
        resolve(''.concat(column).concat(line));
    });
}
exports.setup = setup;
function nextMove(gameState) {
    globalState.stateHistory.push(gameState);
    var allWalls = gameState.ownWalls.concat(gameState.opponentWalls);
    // If you do not see the other player's pawn, move towards the goal
    var opponentCoordinates = getPlayerCoordinates(gameState.board, globalState.opponent);
    if (opponentCoordinates === null) {
        var possibleMoves = getPossibleWallPositions(gameState.ownWalls);
        var maxNumberOfTurnsTillGoal_1 = 0;
        var bestMove_1 = '11';
        for (var i = 1; i < 10; i++) {
            for (var j = 1; j < 10; j++) {
                if (gameState.board[i][j] === globalState.player) {
                    var newNumberOfTurnsTillGoal = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls.concat([[''.concat(i).concat(j), Direction.HORIZONTAL]]));
                    if (newNumberOfTurnsTillGoal > maxNumberOfTurnsTillGoal_1) {
                        maxNumberOfTurnsTillGoal_1 = newNumberOfTurnsTillGoal;
                        bestMove_1 = ''.concat(i).concat(j);
                    }
                }
            }
        }
        possibleMoves.forEach(function (move) {
            var newNumberOfTurnsTillGoal = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls.concat([move]));
            if (newNumberOfTurnsTillGoal > maxNumberOfTurnsTillGoal_1) {
                maxNumberOfTurnsTillGoal_1 = newNumberOfTurnsTillGoal;
                bestMove_1 = move[0];
            }
        });
        return new Promise(function (resolve) {
            resolve({ action: 'move', value: bestMove_1 });
        });
    }
    // If you see the opponent's pawn, check who will win.
    var numberOfTurnsTillGoalForOpponent = getNumberOfTurnsTillGoal(gameState.board, globalState.opponent, allWalls);
    var numberOfTurnsTillGoalForPlayer = getNumberOfTurnsTillGoal(gameState.board, globalState.player, allWalls);
    if (numberOfTurnsTillGoalForOpponent < numberOfTurnsTillGoalForPlayer) {
        // find the best wall to place to block the opponent
        var possibleWalls = getPossibleWallPositions(gameState.ownWalls);
        var maxNumberOfTurnsTillGoalForOpponent_1 = 0;
        var bestWall_1 = possibleWalls[0];
        possibleWalls.forEach(function (wall) {
            var newWalls = gameState.ownWalls.concat([wall]);
            var numberOfTurnsTillGoalForOpponent = getNumberOfTurnsTillGoal(gameState.board, globalState.opponent, newWalls);
            if (numberOfTurnsTillGoalForOpponent > maxNumberOfTurnsTillGoalForOpponent_1) {
                maxNumberOfTurnsTillGoalForOpponent_1 = numberOfTurnsTillGoalForOpponent;
                bestWall_1 = wall;
            }
        });
        // If the new wall is better than the current state, place it
        if (maxNumberOfTurnsTillGoalForOpponent_1 > numberOfTurnsTillGoalForOpponent) {
            return new Promise(function (resolve) {
                resolve({ action: 'placeWall', value: bestWall_1 }); // TODO: ozeliurs verify action name
            });
        }
    }
    return new Promise(function (resolve) {
        resolve({ action: 'move', value: '11' });
    });
}
exports.nextMove = nextMove;
function correction(move) {
    return new Promise(function (resolve) {
        resolve(true);
    });
}
exports.correction = correction;
function updateBoard(gameState) {
    globalState.stateHistory.push(gameState);
    return new Promise(function (resolve) {
        resolve(true);
    });
}
exports.updateBoard = updateBoard;
// === END OF AI ===
function getPlayerCoordinates(board, player) {
    for (var i = 1; i < 10; i++) {
        for (var j = 1; j < 10; j++) {
            if (board[i][j] === player) {
                return [i, j];
            }
        }
    }
    return null;
}
function getWallAtCoordinates(walls, x, y, orientation) {
    for (var i = 0; i < walls.length; i++) {
        if (walls[i][0] === ''.concat(x).concat(y) && walls[i][1] === orientation) {
            return walls[i];
        }
    }
}
exports.getWallAtCoordinates = getWallAtCoordinates;
function getPossibleWallPositions(walls) {
    var possibleWalls = [];
    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 9; j++) {
            if (i < 9 && j < 9) {
                if (!(getWallAtCoordinates(walls, i, j, Direction.HORIZONTAL) || getWallAtCoordinates(walls, i - 1, j, Direction.HORIZONTAL) || getWallAtCoordinates(walls, i, j, Direction.VERTICAL))) {
                    possibleWalls.push([''.concat(i).concat(j), Direction.HORIZONTAL]);
                }
                if (!(getWallAtCoordinates(walls, i, j, Direction.VERTICAL) || getWallAtCoordinates(walls, i, j - 1, Direction.VERTICAL) || getWallAtCoordinates(walls, i, j, Direction.HORIZONTAL))) {
                    possibleWalls.push([''.concat(i).concat(j), Direction.VERTICAL]);
                }
            }
        }
    }
    return possibleWalls;
}
exports.getPossibleWallPositions = getPossibleWallPositions;
function getNumberOfTurnsTillGoal(board, player, walls) {
    var astar = new AStar(board, player, walls);
    var path = astar.search();
    return path.length - 1;
}
exports.getNumberOfTurnsTillGoal = getNumberOfTurnsTillGoal;
// === A* ===
var AStar = /** @class */ (function () {
    function AStar(board, player, walls) {
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
    AStar.prototype.heuristic = function (a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    };
    AStar.prototype.neighbors = function (node) {
        var ret = [];
        var x = node[0];
        var y = node[1];
        // Left
        if (x > 1) {
            // prettier-ignore
            if (!(y > 1 && getWallAtCoordinates(this.walls, x - 1, y, Direction.VERTICAL) ||
                y < 9 && getWallAtCoordinates(this.walls, x - 1, y + 1, Direction.VERTICAL))) {
                ret.push([x - 1, y]);
            }
        }
        // Right
        if (x < 9) {
            // prettier-ignore
            if (!(y > 1 && getWallAtCoordinates(this.walls, x, y, Direction.VERTICAL) ||
                y < 9 && getWallAtCoordinates(this.walls, x, y + 1, Direction.VERTICAL))) {
                ret.push([x + 1, y]);
            }
        }
        // Up
        if (y < 9) {
            // prettier-ignore
            if (!(x > 1 && getWallAtCoordinates(this.walls, x - 1, y + 1, Direction.HORIZONTAL) ||
                x < 9 && getWallAtCoordinates(this.walls, x, y + 1, Direction.HORIZONTAL))) {
                ret.push([x, y + 1]);
            }
        }
        // Down
        if (y > 1) {
            // prettier-ignore
            if (!(x > 1 && getWallAtCoordinates(this.walls, x - 1, y, Direction.HORIZONTAL) ||
                x < 9 && getWallAtCoordinates(this.walls, x, y, Direction.HORIZONTAL))) {
                ret.push([x, y - 1]);
            }
        }
        return ret;
    };
    AStar.prototype.search = function () {
        var openSet = [this.start];
        var cameFrom = {};
        var gScore = {};
        var fScore = {};
        gScore[''.concat(this.start[0]).concat(this.start[1])] = 0;
        fScore[''.concat(this.start[0]).concat(this.start[1])] = this.heuristic(this.start, this.goals[0]);
        var _loop_1 = function () {
            var current = openSet[0];
            var currentStr = ''.concat(current[0]).concat(current[1]);
            for (var i = 1; i < openSet.length; i++) {
                var openSetStr = ''.concat(openSet[i][0]).concat(openSet[i][1]);
                if (fScore[openSetStr] < fScore[currentStr]) {
                    current = openSet[i];
                    currentStr = openSetStr;
                }
            }
            if (
                this_1.goals.some(function (goal) {
                    return goal[0] === current[0] && goal[1] === current[1];
                })
            ) {
                return { value: this_1.reconstructPath(cameFrom, current) };
            }
            openSet = openSet.filter(function (node) {
                return node[0] !== current[0] || node[1] !== current[1];
            });
            var _loop_2 = function (neighbor) {
                var neighborStr = ''.concat(neighbor[0]).concat(neighbor[1]);
                var tentativeGScore = gScore[currentStr] + 1;
                if (tentativeGScore < (gScore[neighborStr] || Infinity)) {
                    cameFrom[neighborStr] = current;
                    gScore[neighborStr] = tentativeGScore;
                    fScore[neighborStr] = gScore[neighborStr] + this_1.heuristic(neighbor, this_1.goals[0]);
                    if (
                        !openSet.some(function (node) {
                            return node[0] === neighbor[0] && node[1] === neighbor[1];
                        })
                    ) {
                        openSet.push(neighbor);
                    }
                }
            };
            for (var _i = 0, _a = this_1.neighbors(current); _i < _a.length; _i++) {
                var neighbor = _a[_i];
                _loop_2(neighbor);
            }
        };
        var this_1 = this;
        while (openSet.length > 0) {
            var state_1 = _loop_1();
            if (typeof state_1 === 'object') return state_1.value;
        }
        return [];
    };
    AStar.prototype.reconstructPath = function (cameFrom, current) {
        var totalPath = [current];
        var currentStr = ''.concat(current[0]).concat(current[1]);
        while (cameFrom[currentStr]) {
            current = cameFrom[currentStr];
            currentStr = ''.concat(current[0]).concat(current[1]);
            totalPath.push(current);
            if (currentStr === ''.concat(this.start[0]).concat(this.start[1])) {
                break;
            }
        }
        return totalPath.reverse();
    };
    return AStar;
})();
exports.AStar = AStar;
