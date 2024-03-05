//Je veux tester toutes les positions possibles pour un pion avec les méthodes fromVellaString et toVellaString

const { Position } = require('./position.js');
const { describe, test } = require('mocha');
const chai = require('chai');

describe('Position.fromVellaString', () => {
    test('Position.fromVellaString("(1,1)")', () => {
        const result = Position.fromVellaString('11');
        console.log(result.getX());
        chai.expect(result.getX()).to.equals(0);
        chai.expect(result.getY()).to.equals(8);
    });

    test('Position.fromVellaString("(9,9)")', () => {
        const result = Position.fromVellaString('99');
        chai.expect(result.getX()).to.equals(8);
        chai.expect(result.getY()).to.equals(0);
    });

    test('Position.fromVellaString("(5,5)")', () => {
        const result = Position.fromVellaString('55');
        chai.expect(result.getX()).to.equals(4);
        chai.expect(result.getY()).to.equals(4);
    });

    test('Position.fromVellaString("(1,9)")', () => {
        const result = Position.fromVellaString('19');
        chai.expect(result.getX()).to.equals(0);
        chai.expect(result.getY()).to.equals(0);
    });

    test('Position.fromVellaString("(9,1)")', () => {
        const result = Position.fromVellaString('91');
        chai.expect(result.getX()).to.equals(8);
        chai.expect(result.getY()).to.equals(8);
    });

    test('Position.fromVellaString("(5,1)")', () => {
        const result = Position.fromVellaString('51');
        chai.expect(result.getX()).to.equals(4);
        chai.expect(result.getY()).to.equals(8);
    });

    test('Position.fromVellaString("(1,5)")', () => {
        const result = Position.fromVellaString('15');
        chai.expect(result.getX()).to.equals(0);
        chai.expect(result.getY()).to.equals(4);
    });
});

describe('Position.toVellaString', () => {
    test('Position.toVellaString(Position(0,8))', () => {
        const result = new Position(0, 8).toVellaString();
        chai.expect(result).to.equals('11');
    });

    test('Position.toVellaString(Position(8,0))', () => {
        const result = new Position(8, 0).toVellaString();
        chai.expect(result).to.equals('99');
    });

    test('Position.toVellaString(Position(4,4))', () => {
        const result = new Position(4, 4).toVellaString();
        chai.expect(result).to.equals('55');
    });

    test('Position.toVellaString(Position(0,0))', () => {
        const result = new Position(0, 0).toVellaString();
        chai.expect(result).to.equals('19');
    });

    test('Position.toVellaString(Position(8,8))', () => {
        const result = new Position(8, 8).toVellaString();
        chai.expect(result).to.equals('91');
    });

    test('Position.toVellaString(Position(4,8))', () => {
        const result = new Position(4, 8).toVellaString();
        chai.expect(result).to.equals('51');
    });

    test('Position.toVellaString(Position(0,4))', () => {
        const result = new Position(0, 4).toVellaString();
        chai.expect(result).to.equals('15');
    });
});
