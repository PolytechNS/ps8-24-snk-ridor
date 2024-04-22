const { setup, nextMove } = require('./snk-ridor.js');
const { describe, test } = require('mocha');
const chai = require('chai');
const { updateBoard } = require('./snk-ridor');
describe('setup function', () => {
    Array.from({ length: 100 }, (_, i) => i + 1).forEach((i) => {
        test(`should return a promise that resolves to a string of two characters ending in 1 when called with 1 (${i}/100)`, async () => {
            const result = await setup(1);
            chai.expect(result).to.be.a('string');
            chai.expect(result.length).to.equal(2);
            chai.expect(result.endsWith('1')).to.equal(true);
        });
    });

    Array.from({ length: 100 }, (_, i) => i + 1).forEach((i) => {
        test(`should return a promise that resolves to a string of two characters ending in 9 when called with 2 (${i}/100)`, async () => {
            const result = await setup(2);
            chai.expect(result).to.be.a('string');
            chai.expect(result.length).to.equal(2);
            chai.expect(result.endsWith('9')).to.equal(true);
        });
    });
});

describe('nextMove function', () => {
    const gameState = {
        opponentWalls: [],
        ownWalls: [],
        board: Array(10).fill(Array(10).fill(0)),
    };

    beforeEach(async () => {
        gameState.opponentWalls = [];
        gameState.ownWalls = [];
        gameState.board = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));

        await setup(1);
    });

    test(`should calculate a correct move`, async () => {
        const result = await nextMove(gameState);

        // Check if the result is an instance of Move
        chai.expect(result).to.have.property('action');
        chai.expect(result).to.have.property('value');

        // Check if the action is one of the valid actions
        chai.expect(['move', 'wall', 'idle']).to.include(result.action);
    });

    test('expect first moves to be wall placements', async () => {
        const move1 = await nextMove(gameState);
        chai.expect(move1.action).to.equal('wall');
        console.log(move1.value);

        const move2 = await nextMove(gameState);
        chai.expect(move2.action).to.equal('wall');
        console.log(move2.value);
    });

    test('player should move at some point', async () => {
        gameState.board[1][1] = 1;
        for (let i = 0; i < 100; i++) {
            gameState.ownWalls.push(['28', 0]);
            gameState.ownWalls.push(['78', 0]);
            const move = await nextMove(gameState);
            if (move.action === 'move') {
                console.log(move.value);
                return;
            }
        }
        throw new Error('Player did not move');
    });

    test('player should try to win', async () => {
        const move1 = await nextMove(gameState);
        chai.expect(move1.action).to.equal('wall');

        gameState.ownWalls.push(['28', 0]);

        const move2 = await nextMove(gameState);
        chai.expect(move2.action).to.equal('wall');

        gameState.ownWalls.push(['78', 0]);

        gameState.board = JSON.parse(JSON.stringify(Array(9).fill(Array(9).fill(0))));
        gameState.board[1][8] = 1;
        const move = await nextMove(gameState);
        chai.expect(move.action).to.equal('move');

        console.log(`Player moved to ${move.value}`);
    });

    test('player should not place a wall on top of another wall', async () => {
        gameState.opponentWalls.push(['28', 0]);
        const move = await nextMove(gameState);
        if (move.action === 'wall') {
            chai.expect(move.value).to.not.deep.equal(['28', 0]);
        }
    });

    test('pathfinding should walk', async () => {
        gameState.board[1][1] = 1;
        gameState.ownWalls.push(['28', 0]);
        gameState.ownWalls.push(['78', 0]);
        while (true) {
            const move = await nextMove(gameState);
            if (move.action === 'move') {
                gameState.board = JSON.parse(JSON.stringify(Array(9).fill(Array(9).fill(0))));
                gameState.board[parseInt(move.value[0])][parseInt(move.value[1])] = 1;
                console.log('Player moved to', move.value);
                if (move.value[1] === '9') {
                    return;
                }
            }
        }
    });

    test('when there is a wall, should go right', async () => {
        gameState.board[1][1] = 1;
        gameState.ownWalls.push(['28', 0]);
        gameState.ownWalls.push(['78', 0]);
        gameState.ownWalls.push(['12', 0]);
        const move = await nextMove(gameState);
        chai.expect(move.action).to.equal('move');
        chai.expect(move.value).to.equal('21');
        console.log('Player moved to', move.value);
    });

    test("when there is a wall and can't go right, should go left", async () => {
        gameState.board[9][1] = 1;
        gameState.ownWalls.push(['28', 0]);
        gameState.ownWalls.push(['78', 0]);
        gameState.ownWalls.push(['92', 0]);
        const move = await nextMove(gameState);
        console.log('Player moved to', move.value);
        chai.expect(move.action).to.equal('move');
        chai.expect(move.value).to.equal('81');
    });

    test("when there is a wall and can't go right, should go left and then continue to go straight ahead", async () => {
        gameState.board[9][1] = 1;
        gameState.ownWalls.push(['28', 0]);
        gameState.ownWalls.push(['78', 0]);
        gameState.ownWalls.push(['92', 0]);
        const move = await nextMove(gameState);
        console.log('Player moved to', move.value);
        chai.expect(move.action).to.equal('move');
        chai.expect(move.value).to.equal('81');
        gameState.board[8][1] = 1;
        gameState.board[9][1] = 0;
        const move2 = await nextMove(gameState);
        console.log('Player moved to', move2.value);
        chai.expect(move2.action).to.equal('move');
        chai.expect(move2.value).to.equal('82');
    });
});
