const { AStar, getPossibleWallPositions, getNumberOfTurnsTillGoal, nextMove, setup } = require('./new-ai');
const { describe, test } = require('mocha');
const { performance } = require('node:perf_hooks');
const chai = require('chai');

function getBoard() {
    return JSON.parse(JSON.stringify(Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 0))));
}

describe('getPossibleWallPositions', () => {
    test('empty board should return all possible wall positions', () => {
        let positions = getPossibleWallPositions([]);
        chai.expect(positions).to.be.an('array');
        console.log(positions);
        chai.expect(positions.length).to.equal(128);
        // Should not contain any duplicates
        chai.expect(new Set(positions).size).to.equal(positions.length);
    });

    test('board with 1 wall should return 125 possible wall positions', () => {
        let positions = getPossibleWallPositions([['55', 0]]);
        chai.expect(positions).to.be.an('array');
        chai.expect(positions.length).to.equal(125);
        chai.expect(positions).to.not.deep.include.members([
            ['55', 0],
            ['45', 0],
            ['45', 1],
        ]);
    });
});

describe('getNumberOfTurnsTillGoal', () => {
    let board;

    beforeEach(() => {
        board = getBoard();
    });

    test('should return 0 when the start and goal are the same', () => {
        board[9][9] = 1;
        const turns = getNumberOfTurnsTillGoal(board, 1, []);
        chai.expect(turns).to.equal(0);
    });

    test('should return 8 when the start and goal are on opposite sides of the board', () => {
        board[1][1] = 1;
        const turns = getNumberOfTurnsTillGoal(board, 1, []);
        chai.expect(turns).to.equal(8);
    });
});

describe('AStar', () => {
    let board;

    // Build a 9x9 array
    beforeEach(() => {
        board = getBoard();
    });

    describe('should correctly set the start node', () => {
        test('when player is 1', () => {
            board[5][9] = 1;
            const aStar = new AStar(board, 1, []);
            const startNode = aStar.start;
            chai.expect(startNode).to.be.an('array');
            chai.expect(startNode).to.deep.equal([5, 9]);
        });

        test('when player is 2', () => {
            board[5][1] = 2;
            const aStar = new AStar(board, 2, []);
            const startNode = aStar.start;
            chai.expect(startNode).to.be.an('array');
            chai.expect(startNode).to.deep.equal([5, 1]);
        });
    });

    describe('should correctly set the goal nodes', () => {
        test('when player is 1', () => {
            const aStar = new AStar(board, 1, []);
            const goalNodes = aStar.goals;
            chai.expect(goalNodes).to.be.an('array');
            chai.expect(goalNodes.length).to.equal(9);
            // prettier-ignore
            chai.expect(goalNodes).to.contain.deep.members([[1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9]]);
        });

        test('when player is 2', () => {
            const aStar = new AStar(board, 2, []);
            const goalNodes = aStar.goals;
            chai.expect(goalNodes).to.be.an('array');
            chai.expect(goalNodes.length).to.equal(9);
            // prettier-ignore
            chai.expect(goalNodes).to.contain.deep.members([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]);
        });
    });

    describe('should correctly return neighbors', () => {
        beforeEach(() => {
            board[1][1] = 1;
        });

        // prettier-ignore
        let testSet = [
            { x: 5, y: 5, walls: [], expected: [[5, 4], [5, 6], [4, 5], [6, 5]], label: 'No walls' },

            // Edges
            { x: 1, y: 5, walls: [], expected: [[1, 4], [1, 6], [2, 5]], label: 'Left Edge' },
            { x: 9, y: 5, walls: [], expected: [[9, 4], [9, 6], [8, 5]], label: 'Right Edge' },
            { x: 5, y: 1, walls: [], expected: [[5, 2], [4, 1], [6, 1]], label: 'Top Edge' },
            { x: 5, y: 9, walls: [], expected: [[5, 8], [4, 9], [6, 9]], label: 'Bottom Edge' },

            // Normal Walls
            { x: 5, y: 5, walls: [[''.concat(5).concat(5), 0]], expected: [[4, 5], [6, 5], [5, 6]], label: 'Bottom Right Wall' },
            { x: 5, y: 5, walls: [[''.concat(5).concat(6), 0]], expected: [[4, 5], [6, 5], [5, 4]], label: 'Top Right Wall' },
            { x: 5, y: 5, walls: [[''.concat(5).concat(5), 1]], expected: [[4, 5], [5, 6], [5, 4]], label: 'Right Bottom Wall' },
            { x: 5, y: 5, walls: [[''.concat(4).concat(5), 1]], expected: [[5, 4], [6, 5], [5, 6]], label: 'Left Bottom Wall' },

            // "Overhanging" Walls
            { x: 5, y: 5, walls: [[''.concat(4).concat(5), 0]], expected: [[4, 5], [6, 5], [5, 6]], label: 'Bottom Left Wall' },
            { x: 5, y: 5, walls: [[''.concat(4).concat(6), 0]], expected: [[4, 5], [6, 5], [5, 4]], label: 'Top Left Wall' },
            { x: 5, y: 5, walls: [[''.concat(5).concat(6), 1]], expected: [[4, 5], [5, 6], [5, 4]], label: 'Right Top Wall' },
            { x: 5, y: 5, walls: [[''.concat(4).concat(6), 1]], expected: [[5, 4], [6, 5], [5, 6]], label: 'Left Top Wall' },

            // Walls on the edges TODO
        ];

        testSet.forEach((t) => {
            test(`should return ${t.expected.length} neighbors with ${t.walls} (${t.label})`, () => {
                const aStar = new AStar(board, 1, t.walls);
                const neighbors = aStar.neighbors([t.x, t.y]);
                console.log(neighbors);
                chai.expect(neighbors).to.be.an('array');
                chai.expect(neighbors.length).to.equal(t.expected.length);
                chai.expect(neighbors).to.deep.include.members(t.expected);
            });
        });
    });

    describe('should correctly calculate the heuristic', () => {
        test('should return 0 when the start and goal are the same', () => {
            const aStar = new AStar(board, 1, []);
            const heuristic = aStar.heuristic([1, 1], [1, 1]);
            chai.expect(heuristic).to.equal(0);
        });

        test('should return 1 when the start and goal are adjacent', () => {
            const aStar = new AStar(board, 1, []);
            const heuristic = aStar.heuristic([1, 2], [1, 1]);
            chai.expect(heuristic).to.equal(1);
        });

        test('should return 2 when the start and goal are diagonal', () => {
            const aStar = new AStar(board, 1, []);
            const heuristic = aStar.heuristic([2, 2], [1, 1]);
            chai.expect(heuristic).to.equal(2);
        });
    });

    describe('search()', () => {
        test('should return an empty array when no path is found', () => {
            board[1][1] = 1;
            let walls = [
                ['15', 0],
                ['25', 0],
                ['35', 0],
                ['45', 0],
                ['55', 0],
                ['65', 0],
                ['75', 0],
                ['85', 0],
                ['95', 0],
            ];
            const aStar = new AStar(board, 1, walls);
            const path = aStar.search();
            chai.expect(path).to.be.an('array');
            chai.expect(path.length).to.equal(0);
        });

        test('should find a path', () => {
            board[1][1] = 1;
            const aStar = new AStar(board, 1, []);
            const path = aStar.search();
            chai.expect(path).to.be.an('array');
            chai.expect(path.length).to.be.greaterThan(0);
        });

        test('should find a path with walls', () => {
            board[5][1] = 1;
            let walls = [
                ['25', 0],
                ['35', 0],
                ['45', 0],
                ['55', 0],
                ['65', 0],
                ['75', 0],
                ['85', 0],
                ['95', 0],
            ];
            const aStar = new AStar(board, 1, walls);
            const path = aStar.search();
            chai.expect(path).to.be.an('array');
            chai.expect(path.length).to.be.greaterThan(0);
        });

        let testSet = Array.from({ length: 1000 }, () => {
            return {
                startIndex: Math.ceil(Math.random() * 9),
                walls: Array.from({ length: Math.ceil(Math.random() * 18) }, () => {
                    return [`${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}`, Math.floor(Math.random() * 2)];
                }),
            };
        });

        testSet.forEach((t) => {
            test(`should find a path with walls (${t.startIndex}, ${t.walls}) under 20ms`, () => {
                board[t.startIndex][1] = 1;
                const aStar = new AStar(board, 1, t.walls);
                const start = performance.now();
                const path = aStar.search();
                const end = performance.now();
                console.log('Time: ', end - start);
                chai.expect(end - start).to.be.lessThan(20);
            });
        });
    });
});

describe('nextMove', () => {
    let board;
    let ownWalls;
    let opponentWalls;

    beforeEach(() => {
        board = getBoard();
        ownWalls = [];
        opponentWalls = [];
    });

    test('should return a move', () => {
        setup(1);
        board[5][1] = 1;
        let move = nextMove({ board: board, ownWalls: [], opponentWalls: [] });
        move.then((m) => {
            chai.expect(m).to.be.an('object');
            chai.expect(m).to.have.property('action');
            chai.expect(m).to.have.property('value');
            chai.expect(m.action).to.be.oneOf(['move', 'wall']);
        });
    });
});
