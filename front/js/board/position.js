export class Position {
    x;
    y;

    constructor(x, y) {
        console.log('Position constructor :' + x + ' ' + y);
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    getX() {
        if (!this.x) {
            throw new Error('x is not defined');
        }
        return this.x;
    }

    getY() {
        if (!this.y) {
            throw new Error('y is not defined');
        }
        return this.y;
    }

    equals(position) {
        return (
            this.getX() === position.getX() && this.getY() === position.getY()
        );
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
        return new Position(
            center.getX() - (point.getY() - center.getY()),
            center.getY() + (point.getX() - center.getX())
        );
    }
}
