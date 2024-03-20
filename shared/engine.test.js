//Ecrit un test pour la méthode newGame de la classe Engine

let { Engine } = require('./engine.js');

const { describe, test } = require('mocha');
const chai = require('chai');

describe('Engine', () => {
    let engine;
    beforeEach(() => {
        engine = new Engine();
    });

    describe('display_board', () => {
        test('should return a string', () => {
            chai.expect(engine.display_board()).to.be.a('string');
        });
    });
});
