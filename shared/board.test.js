let { Board } = require('./board.js');

describe('Board', () => {
    let board;
    beforeEach(() => {
        board = new Board();
    });
    
    it('should have 9 cells', () => {
        expect(board.cells.length).toBe(9);
    });
});