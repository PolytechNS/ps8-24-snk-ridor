const Action = {
    INIT: 0,
    MOVE: 1,
    WALL: 2,
};

class Position {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    id;
    position;
    avatar;

    getPosition() {
        return this.position;
    }
}

class Board {
    players;
    walls; // list of int (0 or 1 or 2) representing no wall, wall placed by player 1, wall placed by player 2
    history; // list of Events

    constructor(x_size, y_size) {
        this.players = [new Player(), new Player()];
        this.walls = Array().fill(
            Array().fill(0, (x_size - 1) * 2),
            y_size - 1
        );
        this.history = [];
    }

    /*
     * @return {Player} the current player
     */
    getFogOfWar() {
        return null;
    }

    getFogOfWarForPlayer(player) {
        return null;
    }

    movePlayer(player, position) {
        return null;
    }

    placeWall(player, position) {
        return null;
    }

    getPlayer(int) {}

    getSize() {}

    getWalls() {}

    toJson() {}

    fromJson() {}
}

class Event {
    player;
    action;
    position;

    constructor(player, action, position) {
        this.player = player;
        this.action = action;
        this.position = position;
    }
}
