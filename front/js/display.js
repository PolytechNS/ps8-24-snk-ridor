import { Board } from "./board_final.js";
import { onCellClick, onWallClick, onWallOut, onWallOver } from "./engine_final.js";

let board = new Board();


/*
 * Uses the board to display the game board
 * @param {Board} the board to display
 * @return {void}
 * @side-effect: display the board
 * @side-effect: add event listeners to the cells and walls
 */
function display_board(board) {

    let BOARD_HEIGHT = board.getHeight();
    let BOARD_WIDTH = board.getWidth();
    
    // reset the board
    let board_div = document.getElementById("board");
    board_div.innerHTML = "";

    // create the cells and walls
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        // for each row, create a line of cells and vertical walls
        for (let j = 0; j < BOARD_WIDTH; j++) {
            // create a cell and add it to the board
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.id = "cell-" + i + "-" + j;
            cell.addEventListener("click", onCellClick);
            board_div.appendChild(cell);
            
            // create a vertical wall and add it to the board
            // if this is not the last column
            if (j < BOARD_WIDTH - 1) {
                let wall = document.createElement("div");
                wall.classList.add("v-wall", "wall");
                wall.id = "v-wall-" + i + "-" + j;
                wall.addEventListener("mouseover", onWallOver);
                wall.addEventListener("mouseout", onWallOut);
                wall.addEventListener("click", onWallClick);
                board_div.appendChild(wall);
            }
        }

        // for each row, create a line of horizontal walls and "small walls"
        for (let j = 0; j < BOARD_WIDTH; j++) {
            // create a horizontal wall and add it to the board
            // if this is not the last row
            if (i < BOARD_HEIGHT - 1) {
                let wall = document.createElement("div");
                wall.classList.add("h-wall", "wall");
                wall.id = "h-wall-" + i + "-" + j;
                wall.addEventListener("mouseover", onWallOver);
                wall.addEventListener("mouseout", onWallOut);
                wall.addEventListener("click", onWallClick);
                board_div.appendChild(wall);
            }

            // create a "small wall" and add it to the board
            // if this is not the last row and the last column
            if (i < BOARD_HEIGHT - 1 && j < BOARD_WIDTH - 1) {
                let wall = document.createElement("div");
                wall.classList.add("s-wall", "wall");
                wall.id = "s-wall-" + i + "-" + j;
                wall.addEventListener("mouseover", onWallOver);
                wall.addEventListener("mouseout", onWallOut);
                wall.addEventListener("click", onWallClick);
                board_div.appendChild(wall);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", display_board(board));