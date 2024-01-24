import { getCorridorPossiblePosition } from "./engine.js";
import { LOG } from "./main.js";

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

function getNearestPosition(positions, goal) {
    var nearest = positions[0];
    var min = Math.abs(nearest[0] - goal);
    for (var i = 1; i < positions.length; i++) {
        var distance = Math.abs(positions[i][0] - goal);
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
    if (position[0] == goal) {
        return list;
    }
    for (var a of sortByNearest(getCorridorPossiblePosition(position[0], position[1]), goal)) {
        if (list[a[0]][a[1]] == 0) {
            console.log("a not in list");
            if (LOG) document.getElementById("cell-" + a[0] + "-" + a[1]).style.setProperty("border", "#44BB44 4px solid");
            list[a[0]][a[1]] = 1;
            var path = recursivePF(a, goal, list);
            if (path != null) {
                return path;
            }
        }
    }
    return null;
}

export function findPath(player, goal) {
    console.log("findPath", player, goal);
    var list = [];
    for (var i = 0; i < 9; i++) {
        list.push([]);
        for (var j = 0; j < 9; j++) {
            list[i].push(0);
        }
    }
    var position = player;
    var path = recursivePF(position, goal, list);
    if (path == null) {
        alert("No path found");
    }
    return path;
}

export function updatePath(player, goal) {
    var cells = document.getElementsByClassName("cell");
    for (var i = 0; i < cells.length; i++) {
        cells[i].style.setProperty("border", "none");
    }
    var path = findPath(player, goal);
    for (var i = 0; i < path.length; i++) {
        if (LOG) document.getElementById("cell-" + path[i][0] + "-" + path[i][1]).style.setProperty("border", "#44BB44 4px solid");
    }
}