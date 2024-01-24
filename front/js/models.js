export let BOARD_HEIGHT = 9;
export let BOARD_WIDTH = 9;

let BOARD_FOW = [ // Fog of war table
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
]

let game;

export function getGame() {
    if (game == null) {
        game = new Game();
    }
    return game;
}

export class Game {
    constructor() {
        this.h_size = BOARD_HEIGHT;
        this.v_size = BOARD_WIDTH;
        this.current_player = 1;
        this.players = [];
        this.p1_pos = [0, 0];
        this.p2_pos = [this.h_size - 1, this.v_size - 1];
        this.board_fow = BOARD_FOW;
        this.begin = parseInt(Date.now());
    }

    addPlayer(player) {
        this.players.push(player);
    }
}

export class Event {
    constructor(type, player, position , new_position = null) {
        this.type = type;
        this.player = player;
        this.position = position;
        this.new_position = new_position;
        this.timestamp = parseInt(Date.now());
    }
}

export class Player {
    constructor() {
        let game = getGame();
        this.id = game.players.length + 1;
        this.position = [(game.h_size - 1) * (this.id-1), 4];
        this.walls = 10;
        this.goal = game.h_size - 1 - position[0];
        game.addPlayer(this);
    }

    move(position) {
        this.position = position;
    }

    placeWall(wall) {
        if (this.walls == 0) {
            return false;
        }
        this.walls -= 1;
        return true;
    }
}