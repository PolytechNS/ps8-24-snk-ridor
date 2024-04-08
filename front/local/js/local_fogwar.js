import { LOG } from './local_main.js';
import { BOARD_HEIGHT, BOARD_WIDTH, getGame, Event, Player } from './local_models.js';

let board_fow;

function setLogStyle() {
    var r = document.querySelector(':root');
    r.style.setProperty('--j1', '#050');
    r.style.setProperty('--j2', '#B00');
    r.style.setProperty('--casej1', '#050');
    r.style.setProperty('--casej2', '#B00');
    r.style.setProperty('--wallj1', '#585');
    r.style.setProperty('--wallj2', '#F55');
    r.style.setProperty('--neutre', '#00B');
    r.style.setProperty('--hover', '#999');
}

export function updateFogOfWar(event) {
    if (LOG) console.log('Updating fog of war on event, event = ');
    if (LOG) console.log(event);
    allBoardFogOfWar();
    return;
    if (event == null) {
        allBoardFogOfWar();
        return;
    }
    if (event.type == 'beginning') {
        if (LOG) console.log(' - Beginning of the game');
        initFogOfWar();
    } else if (event.type == 'move') {
        if (LOG) console.log(' - Player moved');
        moveFogOfWar(event.player, event.position, event.new_position);
    } else if (event.type == 'wall') {
        if (LOG) console.log(' - Wall placed');
        allBoardFogOfWar();
    } else if (event.type == 'end') {
        if (LOG) console.log(' - End of the game');
        removeFogOfWar();
    } else {
        if (LOG) console.log(' - Unknown event');
        allBoardFogOfWar();
    }
}

/* function to initialize the fog of war */
function initFogOfWar() {
    if (LOG) setLogStyle();
    if (LOG) console.log('Initializing fog of war');

    board_fow = getGame().board_fow;
    if (LOG) console.log('BF : ', board_fow);

    // init the board with default values
    for (let y = BOARD_HEIGHT; y > 0; y--) {
        for (let x = 1; x <= BOARD_WIDTH; x++) {
            if (y < parseInt(BOARD_HEIGHT / 2)) {
                board_fow[x - 1][y - 1] = -1;
            }
            if (y > parseInt(BOARD_HEIGHT / 2)) {
                board_fow[x - 1][y - 1] = 1;
            }
            if (y == parseInt(BOARD_HEIGHT / 2)) {
                board_fow[x - 1][y - 1] = 0;
            }
        }
    }

    // for the two players, change the visibility of the 4 cells around them
    for (let p = 1; p <= 2; p++) {
        let player_pos = getGame()['p' + p + '_pos'];
        let x = player_pos[0];
        let y = player_pos[1];
        for (let a of [
            [-1, 0],
            [1, 0],
            [0, 0],
            [0, -1],
            [0, 1],
        ]) {
            let i = a[0];
            let j = a[1];
            if (x + i >= 0 && x + i < BOARD_HEIGHT) {
                if (y + j >= 0 && y + j < BOARD_WIDTH) {
                    if (p == 1) {
                        board_fow[x + i][y + j] += 1;
                    } else {
                        board_fow[x + i][y + j] -= 1;
                    }
                }
            }
        }
    }

    for (let y = BOARD_HEIGHT; y > 0; y--) {
        for (let x = 1; x < BOARD_WIDTH; x++) {
            setVisibility(x - 1, y - 1, board_fow[x - 1][y - 1]);
        }
    }

    updatePlayerVisibility();
    if (LOG) console.log('Fog of war initialized');
    updateFogOfWar('end of initialisation');
}

/* function to update the fog of war on a specific player move */
function moveFogOfWar(player, old_position, new_position) {
    if (LOG) console.log('Updating fog of war for a player move');
    let x = old_position[0];
    let y = old_position[1];
    let new_x = new_position[0];
    let new_y = new_position[1];
    for (let a of [
        [-1, 0],
        [1, 0],
        [0, 0],
        [0, -1],
        [0, 1],
    ]) {
        let i = a[0];
        let j = a[1];
        if (x + i >= 0 && x + i < BOARD_HEIGHT) {
            if (y + j >= 0 && y + j < BOARD_WIDTH) {
                board_fow[x + i][y + j] += player * 2 - 3;
                setVisibility(x + i, y + j, board_fow[x + i][y + j]);
            }
        }
        /* new position */
        if (new_x + i >= 0 && new_x + i < BOARD_HEIGHT) {
            if (new_y + j >= 0 && new_y + j < BOARD_WIDTH) {
                board_fow[new_x + i][new_y + j] += player * -2 + 3;
                setVisibility(new_x + i, new_y + j, board_fow[new_x + i][new_y + j]);
            }
        }
    }
    updatePlayerVisibility();
}

/* function to remove the fog of war */
function removeFogOfWar() {
    if (LOG) console.log('Removing fog of war');
    for (let y = BOARD_HEIGHT; y > 0; y--) {
        for (let x = 1; x < BOARD_WIDTH; x++) {
            setVisibility(x - 1, y - 1, 0);
        }
    }
    updatePlayerVisibility();
}

/* function to update the fog of war for the whole board */
function allBoardFogOfWar() {
    if (LOG) console.log('Updating fog of war for all the board');
    board_fow = getGame().board_fow;

    // init the board with default values
    let limit = parseInt(BOARD_HEIGHT / 2) + 1;
    for (let y = BOARD_HEIGHT; y > 0; y--) {
        for (let x = 1; x <= BOARD_WIDTH; x++) {
            if (y < limit) {
                board_fow[x - 1][y - 1] = 1;
            }
            if (y > limit) {
                board_fow[x - 1][y - 1] = -1;
            }
            if (y == limit) {
                board_fow[x - 1][y - 1] = 0;
            }
        }
    }

    // for the two players, change the visibility of the 4 cells around them
    for (let p = 1; p <= 2; p++) {
        let player_pos = getGame()['p' + p + '_pos'];
        let x = player_pos[0] - 1;
        let y = player_pos[1] - 1;
        if (LOG) console.log(`Player ${p} at position ${x}, ${y}`);
        for (let a of [
            [-1, 0],
            [1, 0],
            [0, 0],
            [0, -1],
            [0, 1],
        ]) {
            let i = a[0];
            let j = a[1];
            if (x + i >= 0 && x + i < BOARD_HEIGHT) {
                if (y + j >= 0 && y + j < BOARD_WIDTH) {
                    if (p == 1) {
                        board_fow[x + i][y + j] += 1;
                    } else {
                        board_fow[x + i][y + j] -= 1;
                    }
                }
            }
        }
    }

    // for the walls placed, change the visibility of cells around them
    // for all the vertical walls
    for (let y = BOARD_HEIGHT; y > 0; y--) {
        for (let x = 1; x < BOARD_WIDTH; x++) {
            let wall = document.getElementById(`v-wall-${x}-${y}`);
            if (wall.player != null) {
                // immediate neighbors
                for (let a of [
                    [0, 0],
                    [0, 1],
                    [1, 0],
                    [1, 1],
                    [0, -1],
                    [1, -1],
                    [-1, 0],
                    [2, 0],
                ]) {
                    let i = a[0] - 1;
                    let j = a[1] - 1;
                    if (x + i > 0 && x + i <= BOARD_WIDTH) {
                        if (y + j > 0 && y + j <= BOARD_HEIGHT) {
                            if (wall.player == 1) {
                                board_fow[x + i][y + j] += 1;
                            } else {
                                board_fow[x + i][y + j] -= 1;
                            }
                        }
                    }
                }
            }
        }
    }

    // for all the horizontal walls
    for (let y = BOARD_HEIGHT; y > 1; y--) {
        for (let x = 1; x < BOARD_WIDTH; x++) {
            let wall = document.getElementById(`h-wall-${x}-${y}`);
            if (wall.player != null) {
                // immediate neighbors
                for (let a of [
                    [-1, -1],
                    [-1, 0],
                    [0, -2],
                    [0, -1],
                    [0, 0],
                    [0, 1],
                    [1, -1],
                    [1, 0],
                ]) {
                    let i = a[0] - 1;
                    let j = a[1] - 1;
                    if (x + i > 0 && x + i <= BOARD_WIDTH) {
                        if (y + j > 0 && y + j <= BOARD_HEIGHT) {
                            if (wall.player == 1) {
                                board_fow[x + i][y + j] += 1;
                            } else {
                                board_fow[x + i][y + j] -= 1;
                            }
                        }
                    }
                }
            }
        }
    }

    if (LOG) console.log('BF : ', board_fow);

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            setVisibility(x, y, board_fow[x][y]);
        }
    }
    updatePlayerVisibility();
}

function setVisibility(x, y, value) {
    let cell = document.getElementById(`cell-${x + 1}-${y + 1}`);
    if (LOG) console.log(`Setting visibility of cell`);
    if (value > 0) {
        if (!cell.classList.contains('visible')) {
            cell.classList.add('visible');
            cell.classList.remove('invisible');
            cell.classList.remove('middle');
        }
    } else if (value == 0) {
        if (!cell.classList.contains('middle')) {
            cell.classList.add('middle');
            cell.classList.remove('visible');
            cell.classList.remove('invisible');
        }
    } else {
        if (!cell.classList.contains('invisible')) {
            cell.classList.add('invisible');
            cell.classList.remove('visible');
            cell.classList.remove('middle');
        }
    }
}

function updatePlayerVisibility() {
    // if the players are not already placed on the board, do nothing
    if (getGame().p1_pos == null || getGame().p2_pos == null) {
        if (LOG) console.log('Players are not placed on the board');
        return;
    }
    let game = getGame();
    let currentPlayer = game.getCurrentPlayer(); // Obtenir le joueur actuel
    let player1Element = document.getElementById('player-1');
    let player2Element = document.getElementById('player-2');

    // Assurez-vous que les éléments existent avant de tenter de mettre à jour leur visibilité
    if (!player1Element || !player2Element) {
        if (LOG) console.log("Les éléments des joueurs n'ont pas été trouvés dans le DOM.");
        return;
    }

    // Obtenir les positions et le brouillard de guerre
    let boardFow = game.board_fow;
    let player1Pos = game.p1_pos;
    let player2Pos = game.p2_pos;

    // Vérifier et mettre à jour la visibilité en fonction du brouillard de guerre et du joueur actuel
    if (currentPlayer.id === game.players[0].id) {
        player1Element.style.visibility = 'visible'; // Le joueur actuel est toujours visible pour lui-même
        player2Element.style.visibility = boardFow[player2Pos[0] - 1][player2Pos[1] - 1] >= 0 ? 'visible' : 'hidden';
    } else {
        player2Element.style.visibility = 'visible'; // Le joueur actuel est toujours visible pour lui-même
        player1Element.style.visibility = boardFow[player1Pos[0] - 1][player1Pos[1] - 1] <= 0 ? 'visible' : 'hidden';
    }

    if (LOG) console.log('PlayerVisibility updated');
}
