import { BOARD_WIDTH, BOARD_HEIGHT, Event, getGame } from "./models.js";
import { onCellClick, next_player } from "./engine.js";
import { LOG } from "./main.js";

export function init_board(board_div, board) {
    board_div.style.gridTemplateColumns = `repeat(${board.h_size * 2 - 1}, min-content)`
    board_div.style.gridTemplateRows = `repeat(${board.v_size * 2 - 1}, min-content)`

    for (let i = 0; i < board.h_size; i++) {
        for (let j = 0; j < board.v_size; j++) {
            // Create Cell
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${i}-${j}`;
            if ((i == 0 || i == board.h_size - 1) && !LOG) {
                cell.classList.add("finish");
            }
            cell.addEventListener("click", onCellClick);
            // TODO: Add event listeners to cells
            if (LOG) cell.textContent = `[${i}, ${j}]`;
            board_div.appendChild(cell);

            // Create Vertical Wall
            if (j < board.h_size - 1) {
                if (LOG) console.log(j);
                let wall = document.createElement("div");
                wall.classList.add("v-wall", "wall");
                wall.id = `v-wall-${i}-${j}`;
                wall.addEventListener("mouseover", on_wall_over);
                wall.addEventListener("mouseout", on_wall_out);
                wall.addEventListener("click", on_wall_click);
                // TODO: Add event listeners to walls
                board_div.appendChild(wall);
            }
        }

        // Create Horizontal and Small Walls
        for (let j = 0; j < board.v_size; j++) {
            if (i < board.v_size - 1) {

                // Create Horizontal Walls
                let wall = document.createElement("div");
                wall.classList.add("h-wall", "wall");
                wall.id = `h-wall-${i}-${j}`;
                wall.addEventListener("mouseover", on_wall_over);
                wall.addEventListener("mouseout", on_wall_out);
                wall.addEventListener("click", on_wall_click);
                // TODO: Add event listeners to walls
                board_div.appendChild(wall);

                if (j < board.h_size - 1) {
                    // Create Small Walls
                    let wall = document.createElement("div");
                    wall.classList.add("s-wall", "wall");
                    wall.id = `s-wall-${i}-${j}`;
                    // TODO: Add event listeners to walls
                    board_div.appendChild(wall);
                }
            }
        }
    }
    
}

// Callback functions for visuals only

function on_wall_over(event) {
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some(wall => wall.classList.contains("placed"))) {
        return;
    }

    for (let wall of walls) {
        wall.classList.add("wall-hover");
    }
}

function on_wall_out(event) {
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some(wall => wall.classList.contains("placed"))) {
        return;
    }

    for (let wall of walls) {
        wall.classList.remove("wall-hover");
    }
}

function on_wall_click(event) {
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some(wall => wall.classList.contains("placed"))) {
        return;
    }
    
    let wall_player = getGame().current_player;
    for (let wall of walls) {
        wall.classList.remove("wall-hover");
        wall.classList.add("placed");
        wall.classList.add(`wall-p${wall_player}`);
        wall.player = wall_player;
    }
    let wall_event = new Event("wall", wall_player, event.walls);
    next_player(wall_event);
}

// Helper functions

function get_walls(event) {
    // When hovering over a wall, it can be difficult to determine which walls are affected. Here lays the truth

    // If the event target is not a wall, return []
    if (!event.target.classList.contains("wall")) {
        return [];
    }

    let main_wall = event.target;

    // If we are hovering a small wall, we do nothing
    if (main_wall.classList.contains("s-wall")) {
        return [];
    }

    let i = parseInt(main_wall.id.split("-")[2]);
    let j = parseInt(main_wall.id.split("-")[3]);

    // If we are hovering a vertical wall
    if (main_wall.classList.contains("v-wall")) {
        // If there is a vertical wall below
        if (i < BOARD_HEIGHT - 1) {
            return [
                main_wall,
                document.getElementById(`s-wall-${i}-${j}`),
                document.getElementById(`v-wall-${i + 1}-${j}`)
            ]
        } else {
            return [
                main_wall,
                document.getElementById(`s-wall-${i - 1}-${j}`),
                document.getElementById(`v-wall-${i - 1}-${j}`)
            ]
        }
    }

    // If we are hovering a horizontal wall
    if (main_wall.classList.contains("h-wall")) {
        // If there is a horizontal wall to the right
        if (j < BOARD_WIDTH - 1) {
            return [
                main_wall,
                document.getElementById(`s-wall-${i}-${j}`),
                document.getElementById(`h-wall-${i}-${j + 1}`)
            ]
        } else {
            return [
                main_wall,
                document.getElementById(`s-wall-${i}-${j - 1}`),
                document.getElementById(`h-wall-${i}-${j - 1}`)
            ]
        }
    }
}