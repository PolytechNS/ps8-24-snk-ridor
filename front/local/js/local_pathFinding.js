import { display_message } from './local_board.js';
import { getCorridorPossiblePositionForPath } from './local_engine.js';
import { LOG } from './local_main.js';

function getNearestPosition(positions, goal) {
    var nearest = positions[0];
    var min = Math.abs(nearest[1] - goal);
    for (var i = 1; i < positions.length; i++) {
        var distance = Math.abs(positions[i][1] - goal);
        if (distance < min) {
            min = distance;
            nearest = positions[i];
        }
    }
    return nearest;
}

function sortByNearest(positions, goal) {
    var sorted = [];
    while (positions.length > 0) {
        var nearest = getNearestPosition(positions, goal);
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
    for (var a of sortByNearest(getCorridorPossiblePositionForPath(position[0], position[1]), goal)) {
        console.log(a);
        if (list[a[0] - 1][a[1] - 1] == 0) {
            if (LOG) document.getElementById(`cell-${a[0]}-${a[1]}`).style.setProperty('border', '#44BB44 4px solid');
            list[a[0] - 1][a[1] - 1] = 1;
            var path = recursivePF(a, goal, list);
            if (path != null) {
                return path;
            }
        }
    }
    return null;
}

export function findPath(player) {
    if (LOG) console.log(`Finding path for player ${player.id}`);
    var list = [];
    for (var i = 0; i < 9; i++) {
        list.push([]);
        for (var j = 0; j < 9; j++) {
            list[i].push(0);
        }
    }
    var path = recursivePF(player.position, player.goal, list);
    if (path == null) {
        if (LOG) display_message('No path found', 'dev_message');
    }
    if (LOG) console.log(path);
    return path;
}

export function updatePath(player) {
    var path = findPath(player);

    if (!LOG) return;
    var cells = document.getElementsByClassName('cell');
    for (var i = 0; i < cells.length; i++) {
        cells[i].style.setProperty('border', 'none');
    }
    for (var i = 0; i < path.length; i++) {
        for (var j = 0; j < path[i].length; j++) {
            if (path[i][j] == 1) {
                document.getElementById('cell-' + i + '-' + j).style.setProperty('border', '#44BB44 4px solid');
            }
        }
    }
}

export function arePathPossible() {
    var list = [];
    for (var i = 0; i < 9; i++) {
        list.push([]);
        for (var j = 0; j < 9; j++) {
            list[i].push(0);
        }
    }
    var position = [0, 4];
    var goal = 8;
    for (let player of getGame().players) {
        position = player.position;
        goal = player.goal;
        if (LOG) console.log(`Player ${player.id} : ${position} -> ${goal}`);
        if (recursivePF(position, goal, list) == null) {
            return false;
        }
    }
    return true;
}
