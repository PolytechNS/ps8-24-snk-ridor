// Globals
let position = '';

function setup(AIplay) {
    let column = Math.ceil(Math.random() * 9);

    switch (AIplay) {
        case 1:
            position = `${column}1`;
            return new Promise((resolve, _) => {
                resolve(`${column}1`);
            });

        case 2:
            position = `${column}9`;
            return new Promise((resolve, _) => {
                resolve(`${column}9`);
            });
        default:
            return new Promise((_, reject) => {
                reject('Invalid AIplay');
            });
    }
}

function nextMove(gameState) {
    return new Promise((resolve, _) => {
        // Move horizontally
        if (position[0] < gameState.player1[0]) {
            position = `${parseInt(position[0]) + 1}${position[1]}`;
        } else if (position[0] > gameState.player1[0]) {
            position = `${parseInt(position[0]) - 1}${position[1]}`;
        }
    });
}

function correction(_) {
    return new Promise((resolve, _) => {
        resolve(true);
    });
}

function updateBoard(_) {
    return new Promise((resolve, _) => {
        resolve(true);
    });
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
