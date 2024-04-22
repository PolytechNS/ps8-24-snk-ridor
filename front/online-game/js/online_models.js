import { display_game } from './online_display.js';
import { LOG } from './online_main.js';

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
        this.p1_pos = [-1, -1];
        this.p2_pos = [-1, -1];
        this.board_fow = BOARD_FOW;
        this.turn_count = 0;
        this.online_player;

        // new
        this.board = [];
        this.own_walls = [];
        this.other_walls = [];
    }

    addPlayer(player) {
        if (LOG) console.log(`Player ${player.id} created at ${player.position} with ${player.walls} walls`, 'dev_message');
        this.players.push(player);
        if (LOG) console.log('list of players', this.players);
    }

    getCurrentPlayer() {
        if (LOG) console.log(`Player ${this.current_player}'s turn`);
        return this.current_player;
    }

    nextPlayer() {
        this.turn_count++;
        this.current_player = ((this.turn_count + 1) % 2) + 1;
        if (LOG) console.log(`next player, Player ${this.current_player}'s turn`);
    }

    getPlayerPosition(player) {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] === player) {
                    return [i + 1, j + 1];
                }
            }
        }
        return [-1, -1];
    }

    remainingWalls(player) {
        if (player == this.online_player) {
            return 10 - this.own_walls.length;
        } else {
            return 10 - this.other_walls.length;
        }
    }

    getPlayer(player) {
        return this.players[player - 1];
    }

    getTurnCount() {
        return this.turn_count;
    }

    setOnlinePlayer(player) {
        this.online_player = player;
    }

    getOnlinePlayer() {
        return this.online_player;
    }

    setBoard(new_board) {
        this.board = new_board;
        display_game(this.board);
    }

    getBoard() {
        return this.board;
    }

    setPlayerWalls(player, walls) {
        if (player == 'own') {
            this.own_walls = walls;
        } else {
            this.other_walls = walls;
        }
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
