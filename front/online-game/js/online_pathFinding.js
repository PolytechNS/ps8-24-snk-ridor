import { display_message } from './online_board.js';
import { getCorridorPossiblePositionForPath } from './online_engine.js';
import { LOG } from './online_main.js';
import { getGame } from './online_models.js';

function getNearestPosition(positions, goal) {
    let nearest = positions[0];
    let min = Math.abs(nearest[1] - goal);
    for (let i = 1; i < positions.length; i++) {
        let distance = Math.abs(positions[i][1] - goal);
        if (distance < min) {
            min = distance;
            nearest = positions[i];
        }
    }
    return nearest;
}

function sortByNearest(positions, goal) {
    let sorted = [];
    while (positions.length > 0) {
        let nearest = getNearestPosition(positions, goal);
        sorted.push(nearest);
        positions.splice(positions.indexOf(nearest), 1);
    }
    return sorted;
}

function recursivePF(position, goal, list) {
    if (LOG) console.log(`recursivePF(position = ${position}, goal line = ${goal})`);
    if (position[1] == goal) {
        if (LOG) console.log('Path found !');
        return list;
    }
    for (let a of sortByNearest(getCorridorPossiblePositionForPath(position[0], position[1]), goal)) {
        if (list[a[0] - 1][a[1] - 1] == 0) {
            if (LOG) document.getElementById(`cell-${a[0]}-${a[1]}`).style.setProperty('border', '#44BB44 4px solid');
            list[a[0] - 1][a[1] - 1] = 1;
            let path = recursivePF(a, goal, list);
            if (path != null) {
                return path;
            }
        }
    }
    return null;
}

export function findPath(player) {
    if (LOG) console.log(`Finding path for player ${player}`);
    let list = [];
    let game = getGame();

    for (let i = 0; i < 9; i++) {
        list.push([]);
        for (let j = 0; j < 9; j++) {
            list[i].push(0);
        }
    }

    if (game.getPlayerPosition(player)[1] == -1 || game.getPlayerPosition(player)[0] == -1) {
        if (LOG) display_message('Player not initialized', 'dev_message');
        return null;
    }

    let path = recursivePF(game.getPlayerPosition(player), player.goal, list);
    if (path == null) {
        if (LOG) display_message('No path found', 'dev_message');
    }
    if (LOG) console.log(path);
    return path;
}

export function updatePath(player) {
    let path = findPath(player);

    if (!LOG) return;
    let cells = document.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        cells[i].style.setProperty('border', 'none');
    }
    for (let i = 0; i < path.length; i++) {
        for (let j = 0; j < path[i].length; j++) {
            if (path[i][j] == 1) {
                document.getElementById(`cell-${i + 1}-${j + 1}`).style.setProperty('border', '#44BB44 4px solid');
            }
        }
    }
}

export function arePathPossible() {
    let list = [];
    for (let i = 0; i < 9; i++) {
        list.push([]);
        for (let j = 0; j < 9; j++) {
            list[i].push(0);
        }
    }
    let position = [0, 4];
    let goal = 8;
    for (let player of getGame().players) {
        position = game.getPlayerPosition(player);
        goal = player.goal;
        if (LOG) console.log(`Player ${player} : ${position} -> ${goal}`);
        if (recursivePF(position, goal, list) == null) {
            return false;
        }
    }
    return true;
}
