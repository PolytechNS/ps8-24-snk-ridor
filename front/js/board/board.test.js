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
            // Check that is teed contains in any order the elements of the array
            chai.expect(
                board.getPossibleMoves(board.getPlayer(0))
            ).to.have.all.deep.members([
                new Position(0, 1),
                new Position(1, 0),
            ]);
        });

        it('should be able to tell me if a player can move down and left', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(8, 0));
            chai.expect(
                board.getPossibleMoves(board.getPlayer(0))
            ).to.have.all.deep.members([
                new Position(7, 0),
                new Position(8, 1),
            ]);
        });

        it('should be able to tell me if a player can move up and right', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(0, 0));
            board.placePlayer(board.getPlayer(1), new Position(0, 8));

            chai.expect(
                board.getPossibleMoves(board.getPlayer(1))
            ).to.have.all.deep.members([
                new Position(0, 7),
                new Position(1, 8),
            ]);
        });

        it('should be able to tell me if a player can move up and left', function () {
            const board = new Board();
            board.placePlayer(board.getPlayer(0), new Position(0, 0));
            board.placePlayer(board.getPlayer(1), new Position(8, 8));

            chai.expect(
                board.getPossibleMoves(board.getPlayer(1))
            ).to.have.all.deep.members([
                new Position(7, 8),
                new Position(8, 7),
            ]);
        });
    });

    it('should be able to place a player', function () {
        var board = new Board();
        board.placePlayer(board.getPlayer(0), new Position(0, 0));
        chai.expect(board.players[0].getPosition()).to.deep.equal(
            new Position(0, 0)
        );
    });

    it('should be able to move a player', function () {
        var board = new Board();
        board.placePlayer(board.getPlayer(0), new Position(0, 0));
        chai.expect(() => {
            board.movePlayer(board.getPlayer(0), new Position(0, 1));
        }).to.not.throw();
        chai.expect(board.players[0].getPosition()).to.deep.equal(
            new Position(0, 1)
        );
    });
});

describe('position', function () {
    it('should be able to tell me if two positions are equal', function () {
        var position1 = new Position(0, 0);
        var position2 = new Position(0, 0);
        var position3 = new Position(1, 0);
        chai.expect(position1.equals(position2)).to.be.true;
        chai.expect(position1.equals(position3)).to.be.false;
    });

    it('should be able to tell me the x and y coordinates', function () {
        var position = new Position(0, 0);
        chai.expect(position.getX()).to.equal(0);
        chai.expect(position.getY()).to.equal(0);
    });

    it('should be able to convert to a string', function () {
        var position = new Position(0, 0);
        chai.expect(position.toString()).to.equal('Position(0,0)');
    });

    it('should be able to be rotated 90 degrees', function () {
        var point = new Position(7, 3);
        var center = new Position(5, 5);
        var rotated = Position.rot90(center, point);
        chai.expect(rotated).to.deep.equal(new Position(7, 7));
    });
});
