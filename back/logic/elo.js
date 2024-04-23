const { User } = require('../db/user');
const { logger } = require('../libs/logging');

function updateElo(player1, player2, loser) {
    logger.debug(`Updating elo for ${player1} and ${player2}`);
    // retrieve users from db
    User.getByEmail(player1).then((user1) => {
        User.getByEmail(player2).then((user2) => {
            if (!user1 || !user2) {
                logger.error('Could not find users');
                return;
            }

            updateEloForUsers(user1, user2, loser);
        });
    });
}

function updateEloForUsers(user1, user2, loser) {
    loser = parseInt(loser);
    let winner = loser === 1 ? 2 : 1;

    // calculate new elo
    let elo1 = user1.elo;
    let elo2 = user2.elo;

    logger.debug(`Calculating new elo for player1: ${elo1} and player2: ${elo2} with winner: ${winner}`);

    if (winner === 1) {
        let diff = elo2 - elo1;
        let gains = Math.max(20, diff / 10);
        logger.debug(`Player 1 gains ${gains} elo`);
        user1.elo += gains;
        User.update(user1.email, user1).then((_) => {});
        user2.elo -= parseInt(gains / 2);
        User.update(user2.email, user2).then((_) => {});
    } else if (winner === 2) {
        let diff = elo1 - elo2;
        let gains = Math.max(20, diff / 10);
        logger.debug(`Player 2 gains ${gains} elo`);
        user2.elo += gains;
        User.update(user2.email, user2).then((_) => {});
        user1.elo -= parseInt(gains / 2);
        User.update(user1.email, user1).then((_) => {});
    } else {
        logger.debug('Tie, keeping elo');
    }
}

module.exports = { updateElo };
