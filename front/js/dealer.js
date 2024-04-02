import { move_player } from './engine.js';

export function onCellClick(event) {
    let cell = event.target;
    let coords = cell.id
        .split('-')
        .slice(1)
        .map((x) => parseInt(x));
    move_player(1, coords[0], coords[1]);
}

export function onWallClick(event) {
    let wall = event.target;
    let coords = wall.id.split('-').map((x) => parseInt(x));
}

export function onWallOver(event) {
    let wall = event.target;
    wall.classList.add('hover');
}

export function onWallOut(event) {
    let wall = event.target;
    wall.classList.remove('hover');
}
