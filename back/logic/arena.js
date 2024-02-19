let {
    setup,
    nextMove,
    correction,
    updateBoard,
    GameState,
} = require('./snk-ridor');

let { getBoard } = require('./board/board.js');
let { Position } = require('./board/position.js');

async function placePlayer(playerId) {
    const board = getBoard();
    const res = await setup(playerId === 0 ? 2 : 1);
    console.log('res', res);
    const player = board.getPlayer(playerId);
    const position = Position.fromVellaString(res);
    board.placePlayer(player, position);
    console.log(
        `getBoard().getPlayer(${playerId}).getPosition()`,
        player.getPosition()
    );
}

async function doMove(playerId) {
    const board = getBoard();

    if ([0, 1].includes(playerId) === false) {
        throw new Error(`Invalid playerId: ${playerId}`);
    }

    console.log('playerId', playerId);

    const player = getBoard().getPlayer(playerId);

    const res = await nextMove(GameState.fromBoard(board, player));
    console.log('res', res);
    if (res.action === 'move') {
        const newPosition = Position.fromVellaString(res.value);
        console.log('newPosition', newPosition);
        board.movePlayer(player, newPosition);
        console.log(
            `getBoard().getPlayer(${playerId}).getPosition()`,
            player.getPosition()
        );
    } else if (res.action === 'wall') {
        // TODO
    } else if (res.action === 'idle') {
        // do nothing
    } else {
        throw new Error(`Invalid action: ${res.action}`);
    }
}

async function main() {
    await placePlayer(1);
    await placePlayer(0);

    while (true) {
        await doMove(1);
        await doMove(0);
    }
}

main();
