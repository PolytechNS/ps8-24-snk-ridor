import { display_message } from './local_board.js';
import { LOG } from './local_main.js';

export let BOARD_HEIGHT = 9;
export let BOARD_WIDTH = 9;

let BOARD_FOW = [
    // Fog of war table
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
];

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
        this.p1_pos = [1, 1];
        this.p2_pos = [this.h_size, this.v_size];
        this.board_fow = BOARD_FOW;
        this.turn_count = 1;
    }

    addPlayer(player) {
        if (LOG) console.log(`Player ${player.id} created at ${player.position} with ${player.walls} walls`, 'dev_message');
        this.players.push(player);
        if (LOG) console.log('list of players', this.players);
    }

    getCurrentPlayer() {
        if (LOG) console.log(`Player ${this.current_player}'s turn`);
        return this.players[this.current_player - 1];
    }

    nextPlayer() {
        this.current_player = (this.current_player % 2) + 1;
        this.turn_count++;
        if (LOG) console.log(`next player, Player ${this.current_player}'s turn`);
    }

    getPlayerPosition(player) {
        if (player == 1) {
            return this.p1_pos;
        } else if (player == 2) {
            return this.p2_pos;
        }
    }

    remainingWalls(player) {
        if (player === undefined || player === null) {
            player = this.current_player;
        }
        console.log('remaining walls', player, this.players, this.players[player - 1]);
        return this.players[player - 1].remainingWalls();
    }

    getPlayer(player) {
        return this.players[player - 1];
    }

    getTurnCount() {
        return this.turn_count;
    }
}

export class Event {
    constructor(type, player, position, new_position = null) {
        if (LOG) console.log(`Event ${type} created for player ${player.id} at ${position} with new position ${new_position}`);
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
        this.position = [(game.h_size - 1) * (this.id % 2), 2];
        this.walls = 10;
        if (this.id == 1) {
            this.goal = 9;
        } else if (this.id == 2) {
            this.goal = 1;
        }
        game.addPlayer(this);
        this.updateProfile();
        if (LOG) console.log(`Player ${this.id} created at ${this.position} with ${this.walls} walls`);
    }

    move(position) {
        if (LOG) console.log(`Player ${this.id} moved from ${this.position} to ${position}`);
        this.position = position;
    }

    remainingWalls() {
        return this.walls;
    }

    placeWall() {
        if (this.walls == 0) {
            return false;
        }
        this.walls -= 1;
        return true;
    }

    updateProfile() {
        if (LOG) console.log(`Player ${this.id} updated his profile`);
        if (this.id == 1) {
            let profile = document.getElementById(`self_profile`);
            profile.getElementsByClassName('walls')[0].textContent = this.walls;
        } else if (this.id == 2) {
            let profile = document.getElementById(`other_profile`);
            profile.getElementsByClassName('walls')[0].textContent = this.walls;
        }
    }
}
