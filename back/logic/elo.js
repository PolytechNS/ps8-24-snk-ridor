import { logger } from '../libs/logging';
import { User } from '../db/user';

function updateElo(player1, player2, loser) {
    // retrieve users from db
    let user1 = User.getByName(player1);
    let user2 = User.getByName(player2);

    loser = parseInt(loser);
    let winner = loser === 1 ? 2 : 1;

    // calculate new elo
    let elo1 = user1.elo;
    let elo2 = user2.elo;

    if (winner === 1) {
        let diff = elo2 - elo1;
        let gains = Math.max(20, diff / 10);
        logger.debug(`Player 1 gains ${gains} elo`);
        user1.elo += gains;
        User.update(user1).then((_) => {});
    } else if (winner === 2) {
        let diff = elo1 - elo2;
        let gains = Math.max(20, diff / 10);
        logger.debug(`Player 2 gains ${gains} elo`);
        user2.elo += gains;
        User.update(user2).then((_) => {});
    } else {
        logger.warn('Invalid winner');
    }
}

module.exports = { updateElo };
