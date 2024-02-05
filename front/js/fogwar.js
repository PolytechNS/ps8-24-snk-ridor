import { LOG } from "./main.js";
import { BOARD_HEIGHT, BOARD_WIDTH, getGame, Event } from "./models.js";

let board_fow;

document.addEventListener('DOMContentLoaded', function () {
    let clock = 0;
    let time = 0;
    let begin = parseInt(Date.now());
    setInterval(function () {
        clock = parseInt(Date.now() / 1000 % 12);
        if (Date.now() / 500 % 2 > 1) {
            clock += 12;
        }
        time = parseInt((Date.now() - begin + 500) / 1000);
        document.getElementById("clock").innerHTML = "&#" + (128336 + clock) + ";" + " " + parseInt(time / 60) + ":" + parseInt(time % 60).toString().padStart(2, "0");
    }, 1000 / 2);
});


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
    if (LOG) console.log("Updating fog of war on event, event = ");
    if (LOG) console.log(event);
    if (event.type == "beginning") {
        if (LOG) console.log(" - Beginning of the game");
        initFogOfWar();
    } else if (event.type == "move") {
        if (LOG) console.log(" - Player moved");
        moveFogOfWar(event.player, event.position, event.new_position);
    } else if (event.type == "wall") {
        if (LOG) console.log(" - Wall placed");
        allBoardFogOfWar();
    } else if (event.type == "end") {
        if (LOG) console.log(" - End of the game");
        removeFogOfWar();
    } else {
        if (LOG) console.log(" - Unknown event");
        allBoardFogOfWar();
    }
}

/* function to initialize the fog of war */
function initFogOfWar() {
    if (LOG) setLogStyle();
    if (LOG) console.log("Initializing fog of war");

    board_fow = getGame().board_fow;
    if (LOG) console.log("BF : ", board_fow);

    // init the board with default values
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (i < parseInt(BOARD_HEIGHT / 2)) {
                board_fow[i][j] = -1;
            } else if (i > parseInt(BOARD_HEIGHT / 2)) {
                board_fow[i][j] = 1;
            } else {
                board_fow[i][j] = 0;
            }
        }
    }
    // for the two players, change the visibility of the 4 cells around them 
    for (let p = 1; p <= 2; p++) {
        let player_pos = getGame()["p" + p + "_pos"];
        let x = player_pos[0];
        let y = player_pos[1];
        for (let a of [[-1, 0], [1, 0], [0, 0], [0, -1], [0, 1]]) {
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

    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            setVisibility(i, j, board_fow[i][j]);
        }
    }
}

/* function to update the fog of war on a specific player move */
function moveFogOfWar(player, old_position, new_position) {
    if (LOG) console.log("Updating fog of war for a player move");
    let x = old_position[0];
    let y = old_position[1];
    let new_x = new_position[0];
    let new_y = new_position[1];
    for (let a of [[-1, 0], [1, 0], [0, 0], [0, -1], [0, 1]]) {
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
}

/* function to remove the fog of war */
function removeFogOfWar() {
    if (LOG) console.log("Removing fog of war");
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            setVisibility(i, j, 0);
        }
    }
}


/* function to update the fog of war for the whole board */
function allBoardFogOfWar() {
    if (LOG) console.log("Updating fog of war for all the board");

    // init the board with default values
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (i < parseInt(BOARD_HEIGHT / 2)) {
                board_fow[i][j] = -1;
            } else if (i > parseInt(BOARD_HEIGHT / 2)) {
                board_fow[i][j] = 1;
            } else {
                board_fow[i][j] = 0;
            }
        }
    }

    // for the two players, change the visibility of the 4 cells around them
    for (let p = 1; p <= 2; p++) {
        let player_pos = getGame()["p" + p + "_pos"];
        let x = player_pos[0];
        let y = player_pos[1];
        for (let a of [[-1, 0], [1, 0], [0, 0], [0, -1], [0, 1]]) {
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
    for (let i = 0; i < BOARD_HEIGHT - 1; i++) {
        for (let j = 0; j < BOARD_WIDTH - 1; j++) {
            let wall = document.getElementById(`v-wall-${i}-${j}`);
            if (wall.player != null) {
                // immediate neighbors
                for (let a of [[0, 0], [0, 1], [1, 0], [1, 1], [-1, 0], [-1, 1], [0, -1], [0, 2]]) {
                    let x = a[0];
                    let y = a[1];
                    if (i + x >= 0 && i + x < BOARD_HEIGHT) {
                        if (j + y >= 0 && j + y < BOARD_WIDTH) {
                            if (wall.player == 1) {
                                board_fow[i + x][j + y] += 1;
                            } else {
                                board_fow[i + x][j + y] -= 1;
                            }
                        }
                    }
                }
            }
        }
    }

    // for all the horizontal walls
    for (let i = 0; i < BOARD_HEIGHT - 1; i++) {
        for (let j = 0; j < BOARD_WIDTH - 1; j++) {
            let wall = document.getElementById(`h-wall-${i}-${j}`);
            if (wall.player != null) {
                // immediate neighbors
                for (let a of [[0, 0], [0, 1], [1, 0], [1, 1], [0, -1], [1, -1], [-1, 0], [2, 0]]) {
                    let x = a[0];
                    let y = a[1];
                    if (i + x >= 0 && i + x < BOARD_HEIGHT) {
                        if (j + y >= 0 && j + y < BOARD_WIDTH) {
                            if (wall.player == 1) {
                                board_fow[i + x][j + y] += 1;
                            } else {
                                board_fow[i + x][j + y] -= 1;
                            }
                        }
                    }
                }
            }
        }
    }

    // updade the visibility
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            setVisibility(i, j, board_fow[i][j]);
        }
    }
}

function setVisibility(x, y, value) {
    let cell = document.getElementById(`cell-${x}-${y}`);
    if (LOG) console.log(`Setting visibility of cell`);
    if (value > 0) {
        if (!cell.classList.contains("visible")) {
            cell.classList.add("visible");
            cell.classList.remove("invisible");
            cell.classList.remove("middle");
        }
    } else if (value == 0) {
        if (!cell.classList.contains("middle")) {
            cell.classList.add("middle");
            cell.classList.remove("visible");
            cell.classList.remove("invisible");
        }
    } else {
        if (!cell.classList.contains("invisible")) {
            cell.classList.add("invisible");
            cell.classList.remove("visible");
            cell.classList.remove("middle");
        }
    }
}

// Classe pour gérer le brouillard de guerre
/* Brouillard de guerre avec Canvas, out of date */
/*
    class FogOfWar {
        constructor(element) {
            let rect = element.getBoundingClientRect();
            // Créer un canvas pour le brouillard de guerre
            this.canvas = document.getElementById('fogCanvas');
            this.ctx = this.canvas.getContext('2d');
    
            this.width = rect.width;
            this.height = rect.height;
            this.x_pos = rect.top;
            this.y_pos = rect.left;
            this.color = "grey";
            this.radius = 10;
    
            // Créer une image de fond pour le brouillard
            this.imageData = new ImageData(this.width, this.height);
            this.imageData.data.fill(0); // Remplir l'image de fond avec des pixels noirs
        }
    
    
        draw() {
            let ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height); // Effacer le canvas
    
            // Dessiner un rectangle noir en arrière-plan
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);
    
            // Dessiner un cercle clair au centre du canvas pour simuler le champ de vision
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(150, 20, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
*/