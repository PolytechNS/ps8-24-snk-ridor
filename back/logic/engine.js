const { logger } = require('../libs/logging');

function playerLost(player, room_hash, meta) {
    if (player === -1) {
        logger.trace('Game drawn.');
    } else {
        logger.trace(`Player ${player} lost.`);
    }
    displayState(meta);
    const { endGame } = require('../routes/games');
    endGame(player, room_hash, meta);
}

function displayState(meta) {
    meta['gameStates'] = meta['gameStates'] || [];
    let gameState = [];
    for (let i = 0; i < 17; i++) {
        gameState[i] = [];
        for (let j = 0; j < 17; j++) {
            if (i % 2 || j % 2) {
                gameState[i][j] = 'E';
            } else {
                gameState[i][j] = '';
            }
        }
    }

    try {
        let p1x = 2 * (9 - meta['p1Pos'][1]);
        let p1y = 2 * (meta['p1Pos'][0] - 1);

        let p2x = 2 * (9 - meta['p2Pos'][1]);
        let p2y = 2 * (meta['p2Pos'][0] - 1);

        gameState[p1x][p1y] = 'A';
        gameState[p2x][p2y] = 'B';

        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            let nwc = 2 * (wc - 1);
            let nwr = 2 * (9 - wr);
            if (wall[1] === 1) {
                gameState[nwr][nwc + 1] = 'W';
                gameState[nwr + 2][nwc + 1] = 'W';
            } else {
                gameState[nwr + 1][nwc] = 'W';
                gameState[nwr + 1][nwc + 2] = 'W';
            }
        }
    } catch (error) {
        meta['gameStates'].push(gameState);
        return;
    }
    meta['gameStates'].push(gameState);
}

function getGameState(player, meta) {
    let board = [];
    for (let i = 0; i < 9; i++) {
        board[i] = [];
        for (let j = 0; j < 4; j++) {
            board[i][j] = 1;
        }
        board[i][4] = 0;
        for (let j = 5; j < 9; j++) {
            board[i][j] = -1;
        }
    }

    // Increase visibility p1

    // current square
    board[meta['p1Pos'][0] - 1][meta['p1Pos'][1] - 1]++;
    // top square
    if (meta['p1Pos'][1] < 9) board[meta['p1Pos'][0] - 1][meta['p1Pos'][1]]++;
    // bottom square
    if (meta['p1Pos'][1] > 1) board[meta['p1Pos'][0] - 1][meta['p1Pos'][1] - 2]++;
    // left square
    if (meta['p1Pos'][0] > 1) board[meta['p1Pos'][0] - 2][meta['p1Pos'][1] - 1]++;
    // right square
    if (meta['p1Pos'][0] < 9) board[meta['p1Pos'][0]][meta['p1Pos'][1] - 1]++;

    // Increase visibility p2

    // current square
    board[meta['p2Pos'][0] - 1][meta['p2Pos'][1] - 1]--;
    // top square
    if (meta['p2Pos'][1] < 9) board[meta['p2Pos'][0] - 1][meta['p2Pos'][1]]--;
    // bottom square
    if (meta['p2Pos'][1] > 1) board[meta['p2Pos'][0] - 1][meta['p2Pos'][1] - 2]--;
    // left square
    if (meta['p2Pos'][0] > 1) board[meta['p2Pos'][0] - 2][meta['p2Pos'][1] - 1]--;
    // right square
    if (meta['p2Pos'][0] < 9) board[meta['p2Pos'][0]][meta['p2Pos'][1] - 1]--;

    // If walls is undefined, make it be an empty array
    meta['walls'] = meta['walls'] || [[], []];

    // Increase visibility p1 walls
    for (let wall of meta['walls'][0]) {
        let [wc, wr] = wall[0].split('').map((e) => e * 1);

        // 2 visibility
        board[wc - 1][wr - 1] += 2;
        board[wc - 1][wr - 2] += 2;
        board[wc][wr - 1] += 2;
        board[wc][wr - 2] += 2;

        // 1 visibility : top
        if (wr < 9) {
            board[wc - 1][wr]++;
            if (wc < 9) {
                board[wc][wr]++;
            }
        }

        // 1 visibility : bottom
        if (wr > 2) {
            board[wc - 1][wr - 3]++;
            if (wc < 9) {
                board[wc][wr - 3]++;
            }
        }

        // 1 visibility : left
        if (wc > 1) {
            board[wc - 2][wr - 1]++;
            if (wr > 1) {
                board[wc - 2][wr - 2]++;
            }
        }

        // 1 visibility : right
        if (wc < 8) {
            board[wc + 1][wr - 1]++;
            if (wr > 1) {
                board[wc + 1][wr - 2]++;
            }
        }
    }

    // Increase visibility p2 walls
    for (let wall of meta['walls'][1]) {
        let [wc, wr] = wall[0].split('').map((e) => e * 1);

        // 2 visibility
        board[wc - 1][wr - 1] -= 2;
        board[wc - 1][wr - 2] -= 2;
        board[wc][wr - 1] -= 2;
        board[wc][wr - 2] -= 2;

        // 1 visibility : top
        if (wr < 9) {
            board[wc - 1][wr]--;
            if (wc < 9) {
                board[wc][wr]--;
            }
        }

        // 1 visibility : bottom
        if (wr > 2) {
            board[wc - 1][wr - 3]--;
            if (wc < 9) {
                board[wc][wr - 3]--;
            }
        }

        // 1 visibility : left
        if (wc > 1) {
            board[wc - 2][wr - 1]--;
            if (wr > 1) {
                board[wc - 2][wr - 2]--;
            }
        }

        // 1 visibility : right
        if (wc < 8) {
            board[wc + 1][wr - 1]--;
            if (wr > 1) {
                board[wc + 1][wr - 2]--;
            }
        }
    }

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cellVisibility = board[i][j];
            // If the player is on the cell
            if ((i === meta['p1Pos'][0] - 1 && j === meta['p1Pos'][1] - 1 && player === 1) || (i === meta['p2Pos'][0] - 1 && j === meta['p2Pos'][1] - 1 && player === 2)) board[i][j] = 1;
            // If the opponent is on the cell and the player can see it.
            // If p1 is the opponent
            else if (
                (i === meta['p1Pos'][0] - 1 &&
                    j === meta['p1Pos'][1] - 1 &&
                    player === 2 &&
                    // Player will see its opponent if it's on a cell he can see
                    (cellVisibility <= 0 ||
                        // Or if it is 1 cell away.
                        (meta['p1Pos'][0] === meta['p2Pos'][0] && Math.abs(meta['p2Pos'][1] - meta['p1Pos'][1]) === 1) ||
                        (meta['p1Pos'][1] === meta['p2Pos'][1] && Math.abs(meta['p2Pos'][0] - meta['p1Pos'][0]) === 1))) ||
                // Same if p2 is the opponent
                (i === meta['p2Pos'][0] - 1 &&
                    j === meta['p2Pos'][1] - 1 &&
                    player === 1 &&
                    // Player will see its opponent if it's on a cell he can see
                    (cellVisibility >= 0 ||
                        // Or if it is 1 cell away
                        (meta['p1Pos'][0] === meta['p2Pos'][0] && Math.abs(meta['p2Pos'][1] - meta['p1Pos'][1]) === 1) ||
                        (meta['p1Pos'][1] === meta['p2Pos'][1] && Math.abs(meta['p2Pos'][0] - meta['p1Pos'][0]) === 1)))
            )
                board[i][j] = 2;
            // If the player can't see the cell
            else if ((cellVisibility < 0 && player === 1) || (cellVisibility > 0 && player === 2)) board[i][j] = -1;
            // If it's not one of the cases above, it should be an empty visible cell.
            else board[i][j] = 0;
        }
    }

    return {
        opponentWalls: meta['walls'][Math.abs(player - 2)],
        ownWalls: meta['walls'][player - 1],
        board: board,
    };
}

function getRandomMove(player, meta) {
    let [pc, pr] = player === 1 ? meta['p1Pos'] : meta['p2Pos'];
    let [oc, or] = player === 2 ? meta['p1Pos'] : meta['p2Pos'];

    let possibleMoves = {
        top1: [pc, pr + 1],
        top2: [pc, pr + 2],

        bottom1: [pc, pr - 1],
        bottom2: [pc, pr - 2],

        left1: [pc - 1, pr],
        left2: [pc - 2, pr],

        right1: [pc + 1, pr],
        right2: [pc + 2, pr],
    };

    // First remove out-of-bounds moves
    if (pc < 2) delete possibleMoves.left1;
    if (pc < 3) delete possibleMoves.left2;

    if (pr < 2) delete possibleMoves.bottom1;
    if (pr < 3) delete possibleMoves.bottom2;

    if (pc > 8) delete possibleMoves.right1;
    if (pc > 7) delete possibleMoves.right2;

    if (pr > 8) delete possibleMoves.top1;
    if (pr > 7) delete possibleMoves.top2;

    // Then remove moves depending on the opponent
    if (pc === oc) {
        delete possibleMoves.right2;
        delete possibleMoves.left2;

        if (pr === or - 1) delete possibleMoves.top1;
        else delete possibleMoves.top2;

        if (pr === or + 1) delete possibleMoves.bottom1;
        else delete possibleMoves.bottom2;
    } else if (pr === or) {
        delete possibleMoves.top2;
        delete possibleMoves.bottom2;

        if (pc === oc - 1) delete possibleMoves.right1;
        else delete possibleMoves.right2;

        if (pc === oc + 1) delete possibleMoves.left1;
        else delete possibleMoves.left2;
    } else {
        delete possibleMoves.top2;
        delete possibleMoves.left2;
        delete possibleMoves.bottom2;
        delete possibleMoves.right2;
    }

    // Finally, check the walls
    for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
        let [wc, wr] = wall[0].split('').map((e) => e * 1);

        // Top / bottom
        if (wall[1] === 0) {
            // 1 TOP
            if ((wc === pc && wr === pr + 1) || (wc === pc - 1 && wr === pr + 1)) {
                delete possibleMoves.top1;
                delete possibleMoves.top2;
                continue;
            }
            // 2 TOP
            if ((wc === pc && wr === pr + 2) || (wc === pc - 1 && wr === pr + 2)) {
                delete possibleMoves.top2;
                continue;
            }

            // 1 BOTTOM
            if ((wc === pc && wr === pr) || (wc === pc - 1 && wr === pr)) {
                delete possibleMoves.bottom1;
                delete possibleMoves.bottom2;
                continue;
            }
            // 2 TOP
            if ((wc === pc && wr === pr - 1) || (wc === pc - 1 && wr === pr - 1)) {
                delete possibleMoves.bottom2;
            }
            // left / right
        } else {
            // 1 RIGHT
            if ((wc === pc && wr === pr + 1) || (wc === pc && wr === pr)) {
                delete possibleMoves.right1;
                delete possibleMoves.right2;
                continue;
            }
            // 2 RIGHT
            if ((wc === pc + 1 && wr === pr + 1) || (wc === pc + 1 && wr === pr)) {
                delete possibleMoves.right2;
                continue;
            }

            // 1 LEFT
            if ((wc === pc - 1 && wr === pr) || (wc === pc - 1 && wr === pr + 1)) {
                delete possibleMoves.left1;
                delete possibleMoves.left2;
                continue;
            }
            // 2 LEFT
            if ((wc === pc - 2 && wr === pr) || (wc === pc - 2 && wr === pr + 1)) {
                delete possibleMoves.left2;
            }
        }
    }

    let legalMoves = Object.keys(possibleMoves);
    if (legalMoves.length) {
        return {
            action: 'move',
            value: possibleMoves[legalMoves[Math.floor(Math.random() * legalMoves.length)]].join(''),
        };
    }

    return {
        action: 'idle',
    };
}

function isMoveOK(player, newPos, meta) {
    let playerPos = player === 1 ? meta['p1Pos'] : meta['p2Pos'];
    let opponentPos = player === 2 ? meta['p1Pos'] : meta['p2Pos'];

    if (newPos[0] < 1 || newPos[0] > 9 || newPos[1] < 1 || newPos[1] > 9) return false;
    if (newPos[0] !== playerPos[0] && newPos[1] !== playerPos[1]) return false;

    let distance = Math.abs(newPos[0] - playerPos[0]) + Math.abs(newPos[1] - playerPos[1]);
    if (distance > 2) return false;

    //(newPos, playerPos, opponentPos);

    // It's impossible to move to the same cell the player is already on.
    if (newPos[0] === playerPos[0] && newPos[1] === playerPos[1]) return false;

    // It's impossible to move to a cell where the opponent is.
    if (newPos[0] === opponentPos[0] && newPos[1] === opponentPos[1]) return false;

    // Moving top one cell.
    if (newPos[0] === playerPos[0] && newPos[1] === playerPos[1] + 1) {
        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 1) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a horizontal wall blocks the cell right above.
            if ((wc === newPos[0] && wr === newPos[1]) || (wc === newPos[0] - 1 && wr === newPos[1])) return false;
        }
    }

    // Moving top 2 cells
    else if (newPos[0] === playerPos[0] && newPos[1] === playerPos[1] + 2) {
        // Possible only if opponent is one cell above.
        if (newPos[0] !== opponentPos[0] || newPos[1] !== opponentPos[1] + 1) return false;

        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 1) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a horizontal wall blocks the cell right above.
            if ((wc === newPos[0] && wr === newPos[1] - 1) || (wc === newPos[0] - 1 && wr === newPos[1] - 1)) return false;
            // Impossible if a horizontal wall blocks the cell 2-cells above.
            if ((wc === newPos[0] && wr === newPos[1]) || (wc === newPos[0] - 1 && wr === newPos[1])) return false;
        }
    }

    // Moving bottom one cell.
    else if (newPos[0] === playerPos[0] && newPos[1] === playerPos[1] - 1) {
        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 1) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a horizontal wall block the cell right below.
            if ((wc === newPos[0] && wr === newPos[1] + 1) || (wc === newPos[0] - 1 && wr === newPos[1] + 1)) return false;
        }
    }

    // Moving bottom 2 cells
    else if (newPos[0] === playerPos[0] && newPos[1] === playerPos[1] - 2) {
        // Possible only if opponent is one cell below.
        if (newPos[0] !== opponentPos[0] || newPos[1] !== opponentPos[1] - 1) return false;

        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 1) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a horizontal wall block the cell right below.
            if ((wc === newPos[0] && wr === newPos[1] + 2) || (wc === newPos[0] - 1 && wr === newPos[1] + 2)) return false;
            // Impossible if a horizontal wall block the cell 2-cells below.
            if ((wc === newPos[0] && wr === newPos[1] + 1) || (wc === newPos[0] - 1 && wr === newPos[1] + 1)) return false;
        }
    }

    // Moving left one cell.
    else if (newPos[0] === playerPos[0] - 1 && newPos[1] === playerPos[1]) {
        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 0) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a vertical wall block the cell right on the left.
            if ((wc === newPos[0] && wr === newPos[1]) || (wc === newPos[0] && wr === newPos[1] + 1)) return false;
        }
    }

    // Moving left 2 cells
    else if (newPos[0] === playerPos[0] - 2 && newPos[1] === playerPos[1]) {
        // Possible only if opponent is one cell on the left.
        if (newPos[0] !== opponentPos[0] - 1 || newPos[1] !== opponentPos[1]) return false;

        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 0) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a vertical wall block the cell right on the left.
            if ((wc === newPos[0] + 1 && wr === newPos[1]) || (wc === newPos[0] + 1 && wr === newPos[1] + 1)) return false;
            // Impossible if a vertical wall block the cell 2-cells on the left.
            if ((wc === newPos[0] && wr === newPos[1]) || (wc === newPos[0] && wr === newPos[1] + 1)) return false;
        }
    }

    // Moving right one cell.
    else if (newPos[0] === playerPos[0] + 1 && newPos[1] === playerPos[1]) {
        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 0) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a vertical wall block the cell right on the right.
            if ((wc === newPos[0] - 1 && wr === newPos[1]) || (wc === newPos[0] - 1 && wr === newPos[1] + 1)) return false;
        }
    }

    // Moving right 2 cells
    else if (newPos[0] === playerPos[0] + 2 && newPos[1] === playerPos[1]) {
        // Possible only if opponent is one cell on the right.
        if (newPos[0] !== opponentPos[0] + 1 || newPos[1] !== opponentPos[1]) return false;

        for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
            if (wall[1] === 0) continue;

            let [wc, wr] = wall[0].split('').map((e) => e * 1);
            // Impossible if a vertical wall block the cell right on the left.
            if ((wc === newPos[0] - 2 && wr === newPos[1]) || (wc === newPos[0] - 2 && wr === newPos[1] + 1)) return false;
            // Impossible if a vertical wall block the cell 2-cells on the left.
            if ((wc === newPos[0] - 1 && wr === newPos[1]) || (wc === newPos[0] - 1 && wr === newPos[1] + 1)) return false;
        }
    }

    return true;
}

function isAWayOut(board, cellToCheck, rowToReach, presenceIndicator) {
    let [cc, cr] = cellToCheck;

    // End cases
    if (cr === rowToReach) return true;
    if (board[cc][cr] === presenceIndicator) return false;

    board[cc][cr] = presenceIndicator;

    return (
        (cc > 1 && board[cc - 1][cr] !== 'W' && isAWayOut(board, [cc - 2, cr], rowToReach, presenceIndicator)) ||
        (cc < 16 && board[cc + 1][cr] !== 'W' && isAWayOut(board, [cc + 2, cr], rowToReach, presenceIndicator)) ||
        (cr > 1 && board[cc][cr - 1] !== 'W' && isAWayOut(board, [cc, cr - 2], rowToReach, presenceIndicator)) ||
        (cr < 16 && board[cc][cr + 1] !== 'W' && isAWayOut(board, [cc, cr + 2], rowToReach, presenceIndicator))
    );
}

function isWallOK(newWall, meta) {
    let nwc, nwr;
    try {
        if (newWall.length !== 2 || (newWall[1] !== 0 && newWall[1] !== 1) || newWall[0].length !== 2 || isNaN(newWall[0][0] * 1) || isNaN(newWall[0][1] * 1)) return false;
        [nwc, nwr] = newWall[0].split('').map((e) => e * 1);
    } catch {
        return false;
    }

    if (nwc > 8 || nwc < 1 || nwr > 9 || nwr < 2) return false;

    // Check if there is a wall in the way
    for (let wall of meta['walls'][0].concat(meta['walls'][1])) {
        let [wc, wr] = wall[0].split('').map((e) => e * 1);
        // Cross

        if (wall[0] === newWall[0]) return false;
        // Vertical

        if (newWall[1] === 1 && wall[1] === 1 && wc === nwc && (nwr - 1 === wr || nwr + 1 === wr)) return false;
        // Horizontal

        if (newWall[1] === 0 && wall[1] === 0 && wr === nwr && (nwc - 1 === wc || nwc + 1 === wc)) return false;
    }

    let board = [];
    for (let i = 0; i < 9; i++) {
        board[2 * i] = [];
        board[2 * i + 1] = [];
        for (let j = 0; j < 9; j++) {
            board[2 * i][j * 2] = 0;
            board[2 * i][j * 2 + 1] = 'E';

            board[2 * i + 1][j * 2] = 'E';
            board[2 * i + 1][j * 2 + 1] = 'E';
        }
    }

    for (let wall of meta['walls'][0].concat(meta['walls'][1]).concat([newWall])) {
        let [wc, wr] = wall[0].split('').map((e) => e * 1);
        if (wall[1]) {
            board[2 * (wc - 1) + 1][2 * (wr - 1)] = 'W';
            board[2 * (wc - 1) + 1][2 * (wr - 1) - 2] = 'W';
        } else {
            board[2 * (wc - 1)][2 * (wr - 1) - 1] = 'W';
            board[2 * (wc - 1) + 2][2 * (wr - 1) - 1] = 'W';
        }
    }

    return isAWayOut(board, [2 * (meta['p1Pos'][0] - 1), 2 * (meta['p1Pos'][1] - 1)], 16, 1) && isAWayOut(board, [2 * (meta['p2Pos'][0] - 1), 2 * (meta['p2Pos'][1] - 1)], 0, 2);
}

function gameOverStatus(meta) {
    if (meta['p1Pos'][1] === 9 && meta['p2Pos'][1] === 1) return -1;
    if (meta['p2Pos'][1] === 1) return 1;
    if (meta['p1Pos'][1] === 9) return 2;
    return 0;
}

function updateState(action, player, meta) {
    if (!action) {
        logger.trace('... ... action object not provided');
        return false;
    } else if (!action.action) {
        logger.trace('... ... action.action not provided');
        return false;
    }

    switch (action.action) {
        case 'move':
            let newPos;
            try {
                newPos = action.value.split('').map((e) => e * 1);
                if (newPos.length > 2) return false;
                for (let p of newPos) if (isNaN(p) || p < 1 || p > 9) return false;
            } catch (e) {
                return false;
            }

            if (!isMoveOK(player, newPos)) return false;
            if (player === 1) meta['p1Pos'] = newPos;
            else meta['p2Pos'] = newPos;
            break;
        case 'wall':
            let wall = action.value;
            logger.trace('... ... Checking wall position');
            if (!isWallOK(wall)) return false;
            logger.trace('... ... Wall OK');
            meta['walls'][player - 1].push(wall);
            break;
        case 'idle':
            let move = getRandomMove();
            return move.action === 'idle';
        default:
            return false;
    }

    return true;
}

function startGame(room_hash, meta) {
    logger.trace('Players loaded.');
    logger.trace(`Starting the game...`);
    meta['keepPlaying'] = true;
    meta['failMessage'] = '';
    meta['gameStatus'] = 0;

    // p1 setup;
    logger.trace('Calling Player 1 setup...');
    const { setup } = require('../routes/games');
    setup(1, room_hash, meta);
}

function setup1(room_hash, data, meta) {
    logger.trace('... Analysing setup response...');
    try {
        meta['p1Pos'] = data.data.split('').map((e) => e * 1);
    } catch (e) {
        logger.trace(`... ... Bad content: ${data.data}`);
        playerLost(1, room_hash, meta);

        meta['keepPlaying'] = false;
    }
    logger.trace(`... ... Content received: ${data.data}`);

    if (meta['keepPlaying']) {
        logger.trace('Calling Player 2 setup...');
        const { setup } = require('../routes/games');
        setup(2, room_hash, meta);
    }
}

function setup2(room_hash, data, meta) {
    logger.trace('... Analysing setup response...');
    logger.trace(`... ... Response time OK`);
    try {
        meta['p2Pos'] = data.data.split('').map((e) => e * 1);
    } catch (e) {
        logger.trace(`... ... Bad content: ${data.data}`);
        playerLost(2, room_hash, meta);
        meta['keepPlaying'] = false;
    }
    logger.trace(`... ... Content received: ${data.data}`);

    meta['nbIter'] = 1;
    const { nextMove } = require('../routes/games');
    logger.trace('');
    logger.trace('####################');
    logger.trace(`Player 1 turn ${meta['nbIter']}.`);
    logger.trace('####################\n');
    logger.trace(`Calling nextMove...`);
    nextMove(1, room_hash, meta, getGameState(1, meta));
}

function nextMove1(room_hash, data, meta) {
    logger.trace('... Analysing nextMove response...');
    logger.trace(`... ... Received data: ${JSON.stringify(data)}`);
    let action = data.data;
    if (!updateState(action, 1)) {
        logger.trace(`... ... Incorrect Action: ${JSON.stringify(data.data)}`);
        let randomMove = getRandomMove(1);
        updateState(randomMove, 1);
        logger.trace(`... ... Replacement action: ${JSON.stringify(randomMove)}`);
    } else {
        logger.trace(`... ... Content received: ${JSON.stringify(data.data)}`);
    }

    if (meta['keepPlaying']) {
        displayState();

        //p2 move
        logger.trace('');
        logger.trace('####################');
        logger.trace(`Player 2 turn ${meta['nbIter']}.`);
        logger.trace('####################\n');
        logger.trace(`Calling nextMove...`);
        const { nextMove } = require('../routes/games');
        console.info('meta', meta);
        nextMove(2, room_hash, meta, getGameState(2, meta));
    }
}

function nextMove2(room_hash, data, meta) {
    logger.trace(`... ... Received data: ${JSON.stringify(data)}`);
    let action = data.data;

    if (!updateState(action, 2)) {
        logger.trace(`... ... Incorrect Action: ${JSON.stringify(data.data)}`);
        let randomMove = getRandomMove(2);
        updateState(randomMove, 2);
        logger.trace(`... ... Replacement action: ${JSON.stringify(randomMove)}`);
    } else {
        logger.trace(`... ... Content received: ${JSON.stringify(data.data)}`);
    }

    meta['gameStatus'] = gameOverStatus();
    if (meta['gameStatus']) {
        playerLost(meta['gameStatus'], room_hash, meta);
        meta['keepPlaying'] = false;
        return;
    }

    if (meta['keepPlaying']) {
        displayState();

        logger.trace('');
        logger.trace('####################');
        logger.trace(`Player 1 turn ${meta['nbIter']}.`);
        logger.trace('####################\n');
        logger.trace(`Calling nextMove...`);
        const { nextMove } = require('../routes/games');
        nextMove(1, room_hash, meta, getGameState(1, meta));
    }

    if (meta['nbIter'] === 100) playerLost(-1, room_hash, meta);
}

module.exports = { startGame, setup1, setup2, nextMove1, nextMove2 };
