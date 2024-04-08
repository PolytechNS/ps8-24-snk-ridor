class Position {
    x;
    y;

    constructor(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    getX() {
        if (this.x === undefined) {
            throw new Error('x is not defined');
        }
        return this.x;
    }

    getY() {
        if (this.y === undefined) {
            throw new Error('y is not defined');
        }
        return this.y;
    }

    equals(position) {
        return this.getX() === position.getX() && this.getY() === position.getY();
    }

    /*
     * The tostring method is used to convert the object to a string.
     */
    toString() {
        return `Position(${this.getX()},${this.getY()})`;
    }

    /*
     * Rotates the point around the center by 90 degrees
     * @param {Position} center
     * @param {Position} point
     * @return {Position} the rotated position
     */
    static rot90(center, point, times = 1) {
        return new Position(center.getX() - (point.getY() - center.getY()), center.getY() + (point.getX() - center.getX()));
    }

    /*
     * Reads a Vella compatible string of the position, (1,1) corresponds to our (0,8) and (9,9) to our (8,0)
     */
    static fromVellaString(string) {
        console.log(`Position.fromVellaString(${string})`);
        let x = parseInt(string[0]);
        let y = parseInt(string[1]);

        return new Position(x - 1, 9 - y);
    }

    /*
     * Returns a Vella compatible string of the position, (1,1) corresponds to our (0,8) and (9,9) to our (8,0)
     */
    toVellaString() {
        return `${this.getX() + 1}${9 - this.getY()}`;
    }
}

module.exports = { Position };
