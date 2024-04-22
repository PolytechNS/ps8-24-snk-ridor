import { LOG } from './online_main.js';

function setVisibility(x, y, value) {
    let cell = document.getElementById(`cell-${x + 1}-${y + 1}`);
    if (value > 0) {
        if (!cell.classList.contains('visible')) {
            cell.classList.add('visible');
            cell.classList.remove('invisible');
        }
    } else {
        if (!cell.classList.contains('invisible')) {
            cell.classList.add('invisible');
            cell.classList.remove('visible');
        }
    }
}

function updateFogOfWarFromBack(FOW) {
    if (LOG) console.log('Updating fog of war from back');
    board_fow = FOW;
    const HEIGHT = FOW.length;
    const WIDTH = FOW[0].length;
    for (let y = HEIGHT - 1; y >= 0; y--) {
        for (let x = 0; x < WIDTH; x++) {
            if (FOW[x][y] == -1) {
                setVisibility(x, y, -1);
            } else {
                setVisibility(x, y, 1);
            }
        }
    }
}
