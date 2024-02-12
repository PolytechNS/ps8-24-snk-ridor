export class Position {
    x;
    y;

    constructor(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    equals(position) {
        return this.x === position.x && this.y === position.y;
    }
}
