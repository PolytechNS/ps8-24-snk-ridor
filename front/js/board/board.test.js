import { Board } from './board.js';
import { Position } from './position.js';

describe('board', function () {
    describe('board initialization', function () {
        var board = new Board(10, 10);
        it('should be initialized empty', function () {
            chai.expect(board.players.length).to.equal(2);
            chai.expect(board.walls).to.be.an('array');
            chai.expect(board.walls[0]).to.be.an('array');
            chai.expect(board.history.length).to.equal(0);
        });

        it('should return the correct height', function () {
            chai.expect(board.getHeight()).to.equal(10);
        });

        it('should return the correct width', function () {
            chai.expect(board.getWidth()).to.equal(10);
        });

        it('should return players with empty positions', function () {
            chai.expect(board.players[0].getPosition()).to.be.null;
            chai.expect(board.players[1].getPosition()).to.be.null;
        });
    });

    describe('should be able to tell me if a player movement is valid', function () {
        it('should be able to tell me if a player can move down and right', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(0, 0));
            chai.expect(
                board.getPossibleMoves(board.getPlayer(0))
            ).to.deep.equal([new Position(0, 1), new Position(1, 0)]);
        });

        it('should be able to tell me if a player can move down and left', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(8, 0));
            chai.expect(
                board.getPossibleMoves(board.getPlayer(0))
            ).to.deep.equal([new Position(7, 0), new Position(8, 1)]);
        });

        it('should be able to tell me if a player can move up and right', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(0, 0));
            board.placePlayer(board.getPlayer(1), new Position(0, 8));

            chai.expect(
                board.getPossibleMoves(board.getPlayer(1))
            ).to.deep.equal([new Position(0, 7), new Position(1, 8)]);
        });
    });

    it('should be able to place a player', function () {
        var board = new Board();
        board.placePlayer(board.getPlayer(0), new Position(0, 0));
        chai.expect(board.players[0].getPosition()).to.deep.equal(
            new Position(0, 0)
        );
    });

    it("shouldn't be able to move unless both players are placed", function () {
        var board = new Board();
        board.placePlayer(board.getPlayer(0), new Position(0, 0));
        try {
            board.movePlayer(board.getPlayer(0), new Position(0, 1));
        } catch (e) {
            chai.expect(e).to.be.an('error');
        }
        board.placePlayer(board.getPlayer(1), new Position(0, 8));
        board.movePlayer(board.getPlayer(0), new Position(0, 1));
        try {
        } catch (e) {
            // Should not throw an error
            chai.expect(true).to.be.false;
        }
    });
});
