const { User } = require('../db/user');
const { logger } = require('../libs/logging');
const { Achievement, ACHIEVEMENT } = require('../db/achievements');

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

    const eloDifference = Math.abs(elo1 - elo2);
    let kFactor = 20; // Base K-factor

    // Si l'écart d'ELO est grand, l'échange de points peut être plus important
    if (eloDifference > 500) {
        kFactor = 40;
    } else if (eloDifference > 200) {
        kFactor = 30;
    }

    if (winner === 1) {
        const expectedScoreWinner = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
        const expectedScoreLoser = 1 / (1 + Math.pow(10, (elo1 - elo2) / 400));

        // Calculez le nouveau ELO
        let newWinnerElo = Math.max(elo1 + 5, Math.round(elo1 + kFactor * (1 - expectedScoreWinner)));
        let newLoserElo = Math.min(elo2 - 5, Math.round(elo2 - kFactor * expectedScoreLoser));

        // Assurez-vous que l'ELO ne descende pas en dessous de 0
        logger.debug(`Player 1 gains ${newWinnerElo} elo`);
        user1.elo = Math.max(newWinnerElo, 0);

        logger.debug(`Player 2 loses ${newLoserElo} elo`);
        user2.elo = Math.max(newLoserElo, 0);

        logger.debug(`Player 1 new elo : ${user1.elo} elo`);
        logger.debug(`Player 2 new elo : ${user2.elo} elo`);
        User.update(user1.email, user1).then((_) => {});
        User.update(user2.email, user2).then((_) => {});
    } else if (winner === 2) {
        const expectedScoreWinner = 1 / (1 + Math.pow(10, (elo1 - elo2) / 400));
        const expectedScoreLoser = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));

        // Calculez le nouveau ELO
        let newWinnerElo = Math.max(elo2 + 5, Math.round(elo2 + kFactor * (1 - expectedScoreWinner)));
        let newLoserElo = Math.min(elo1 - 5, Math.round(elo1 - kFactor * expectedScoreLoser));

        // Assurez-vous que l'ELO ne descende pas en dessous de 0
        logger.debug(`Player 2 wins : ${newWinnerElo} elo`);
        user2.elo = Math.max(newWinnerElo, 0);

        logger.debug(`Player 1 loses : ${newLoserElo} elo`);
        user1.elo = Math.max(newLoserElo, 0);

        updateAchievements(user2, user2.elo);
        updateAchievements(user1, user1.elo);

        logger.debug(`Player 2 new elo : ${user2.elo} elo`);
        logger.debug(`Player 1 new elo : ${user1.elo} elo`);
        User.update(user1.email, user1).then((_) => {});
        User.update(user2.email, user2).then((_) => {});
    } else {
        logger.debug('Tie, keeping elo');
    }
}

function updateAchievements(user, elo) {
    if (elo >= 1300) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.BRONZE)).then((_) => {});
    }

    if (elo >= 1600) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.SILVER)).then((_) => {});
    }

    if (elo >= 1900) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.GOLD)).then((_) => {});
    }

    if (elo >= 2100) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.PLATINUM)).then((_) => {});
    }

    if (elo >= 2500) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.DIAMOND)).then((_) => {});
    }

    if (elo === 0) {
        Achievement.create(new Achievement(user.email, ACHIEVEMENT.NO_ELO)).then((_) => {});
    }
}

module.exports = { updateElo };
