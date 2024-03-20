class Player {
    id;
    position;
    avatar;

    constructor(id = 0, avatar = null) {
        this.id = id;
        this.position = null;
        if (avatar === null) {
            this.avatar = `humain_annie`;
        } else {
            this.avatar = avatar;
        }
    }

    getId() {
        return this.id;
    }

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        this.position = position;
    }

    /*
     * @return {int} the number of remaining walls for the player
     */
    remainingWalls() {
        let { getBoard } = require('./board.js');
        // dynamically calculate the remaining walls from the board
        let b = getBoard();
        let placed_walls = 0;
        for (let i = 0; i < b.getSize()[0]; i++) {
            for (let j = 0; j < b.getSize()[1]; j++) {
                if (b.getWalls()[i][j] === this.id) {
                    placed_walls++;
                }
            }
        }
        return 10 - placed_walls / 2;
        // we divide by 2 because each wall is represented by 2 semi-walls
    }
}

module.exports = { Player };
