const { getMongoDatabase } = require('./db');

// Game Status
const GAME_STATUS = {
    PLAYER1_WIN: 0,
    PLAYER2_WIN: 1,
};

class Game {
    player1email;
    player2email;
    status;

    constructor(player1email, player2email, status) {
        this.player1email = player1email;
        this.player2email = player2email;
        this.status = status;
    }

    // DB CRUD operations
    static async create(game) {
        const db = await getMongoDatabase();
        const games = db.collection('games');

        return await games.insertOne(game);
    }

    static async get(playerEmail) {
        const db = await getMongoDatabase();
        const games = db.collection('games');

        return games.find({ $or: [{ player1email: playerEmail }, { player2email: playerEmail }] });
    }

    static async getPlayerElo(playerEmail) {
        let score = 0;

        // make player lose 10 points if they lost a game, gain 10 points if they won
        let games = await Game.get(playerEmail);
        games.forEach((game) => {
            if (game.status === GAME_STATUS.PLAYER1_WIN && game.player1email === playerEmail) {
                score += 10;
            } else if (game.status === GAME_STATUS.PLAYER2_WIN && game.player2email === playerEmail) {
                score += 10;
            } else {
                score -= 10;
            }
        });
    }
}
