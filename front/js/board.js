import { BOARD_WIDTH, BOARD_HEIGHT, Event, getGame } from "./models.js";
import { onCellClick, next_player } from "./engine.js";
import { LOG } from "./main.js";
import { findPath } from "./pathFinding.js";

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

// display message and dismiss it after 3 seconds
export function display_message(message, category = "dev_message") {
    if (LOG) {
        console.log(message);
    } else if (category == "dev_message") {
        return;
    }
    if (category == "final_message") { // si la partie est terminée, on ajoute event et on affiche le message de fin
        document.getElementById("reload").addEventListener("click", () => {
            window.location.reload();
        });
        document.getElementById("final_message").textContent = message;
        document.getElementById("final_div").style.display = "block";
        return;
    }
    let message_div = document.createElement("div");
    message_div.classList.add("alert");
    message_div.classList.add(category); // category can be "dev_message", "forbidden_message", "info_message" or "final_message"
    message_div.textContent = message;
    document.getElementById("game-infos").appendChild(message_div);
    setTimeout(() => {
        message_div.remove();
    }, 4000); // display message for 4 seconds
}

// Callback functions for visuals only

function on_wall_over(event) {
    if (getGame().getCurrentPlayer().remainingWalls() == 0) return;
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
    let wall_player = getGame().getCurrentPlayer();
    if (wall_player.remainingWalls() == 0) {
        display_message("Vous n'avez plus de murs !", "forbidden_message");
        return;
    }
    let walls = get_walls(event);

    // If any of the walls is black, we do nothing
    if (walls.some(wall => wall.classList.contains("placed"))) {
        return;
    }
    
    // TODO : gérer le cas où le joueur n'a plus de murs

    // gérer qu'un chemin doit toujours exister
    for (let p of getGame().players) {
        if (findPath(p) == null) {
            if (LOG) {
                console.log("No path found from " + getGame().getCurrentPlayer().position + " to " + getGame().getCurrentPlayer().goal);
            }
            display_message("Impossible de bloquer le chemin avec un mur !", "forbidden_message");
            return;
        }
    }
    for (let wall of walls) {
        wall.classList.remove("wall-hover");
        wall.classList.add("placed");
        wall.classList.add(`wall-p${wall_player.id}`);
        wall.player = wall_player.id;
    }
    wall_player.placeWall();
    display_message(`il reste ${wall_player.remaining_walls} murs`, "dev_message");
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