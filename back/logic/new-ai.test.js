const { AStar } = require('./new-ai');
const { describe, test } = require('mocha');
const chai = require('chai');

function getBoard() {
    return JSON.parse(
        JSON.stringify(
            Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => 0)
            )
        )
    );
}

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
            // deep equan in any order
            chai.expect(goalNodes).to.contain.deep.members([
                [1, 9],
                [2, 9],
                [3, 9],
                [4, 9],
                [5, 9],
                [6, 9],
                [7, 9],
                [8, 9],
                [9, 9],
            ]);
        });

        test('when player is 2', () => {
            const aStar = new AStar(board, 2, []);
            const goalNodes = aStar.goals;
            chai.expect(goalNodes).to.be.an('array');
            chai.expect(goalNodes.length).to.equal(9);
            // deep equan in any order
            chai.expect(goalNodes).to.contain.deep.members([
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
                [5, 1],
                [6, 1],
                [7, 1],
                [8, 1],
                [9, 1],
            ]);
        });
    });

    describe('should correctly return neighbors', () => {
        beforeEach(() => {
            board[1][1] = 1;
        });

        let testSet = [
            {
                x: 5,
                y: 5,
                walls: [],
                expected: [
                    [5, 4],
                    [5, 6],
                    [4, 5],
                    [6, 5],
                ],
                label: 'No walls',
            },

            // Edges
            {
                x: 1,
                y: 5,
                walls: [],
                expected: [
                    [1, 4],
                    [1, 6],
                    [2, 5],
                ],
                label: 'Left Edge',
            },
            {
                x: 9,
                y: 5,
                walls: [],
                expected: [
                    [9, 4],
                    [9, 6],
                    [8, 5],
                ],
                label: 'Right Edge',
            },
            {
                x: 5,
                y: 1,
                walls: [],
                expected: [
                    [5, 2],
                    [4, 1],
                    [6, 1],
                ],
                label: 'Top Edge',
            },
            {
                x: 5,
                y: 9,
                walls: [],
                expected: [
                    [5, 8],
                    [4, 9],
                    [6, 9],
                ],
                label: 'Bottom Edge',
            },

            // Normal Walls
            {
                x: 5,
                y: 5,
                walls: [[''.concat(5).concat(5), 0]],
                expected: [
                    [4, 5],
                    [6, 5],
                    [5, 6],
                ],
                label: 'Bottom Right Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(5).concat(6), 0]],
                expected: [
                    [4, 5],
                    [6, 5],
                    [5, 4],
                ],
                label: 'Top Right Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(5).concat(5), 1]],
                expected: [
                    [4, 5],
                    [5, 6],
                    [5, 4],
                ],
                label: 'Right Bottom Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(4).concat(5), 1]],
                expected: [
                    [5, 4],
                    [6, 5],
                    [5, 6],
                ],
                label: 'Left Bottom Wall',
            },

            // "Overhanging" Walls
            {
                x: 5,
                y: 5,
                walls: [[''.concat(4).concat(5), 0]],
                expected: [
                    [4, 5],
                    [6, 5],
                    [5, 6],
                ],
                label: 'Bottom Left Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(4).concat(6), 0]],
                expected: [
                    [4, 5],
                    [6, 5],
                    [5, 4],
                ],
                label: 'Top Left Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(5).concat(6), 1]],
                expected: [
                    [4, 5],
                    [5, 6],
                    [5, 4],
                ],
                label: 'Right Top Wall',
            },
            {
                x: 5,
                y: 5,
                walls: [[''.concat(4).concat(6), 1]],
                expected: [
                    [5, 4],
                    [6, 5],
                    [5, 6],
                ],
                label: 'Left Top Wall',
            },

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

    test('should find a path', () => {
        board[1][1] = 1;
        const aStar = new AStar(board, 1, []);
        const path = aStar.search();
        chai.expect(path).to.be.an('array');
        chai.expect(path.length).to.be.greaterThan(0);
    });
});
