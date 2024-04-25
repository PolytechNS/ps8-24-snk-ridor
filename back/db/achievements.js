const { getMongoDatabase } = require('./db');
const { logger } = require('../libs/logging');

const ACHIEVEMENT = {
    EXPLORER: {
        name: 'Explorer',
        description: 'Have created an account on the SNK-ridor Website',
        icon: 'loupe.png',
    },
    FIRST_GAME: {
        name: 'First Game',
        description: 'Have played 1 game',
        icon: 'gamebronze.png',
    },
    PRO_GAMER: {
        name: 'Pro Gamer',
        description: 'Have played 10 games',
        icon: 'gamesilver.png',
    },
    MASTER_GAMER: {
        name: 'Master Gamer',
        description: 'Have played 100 games',
        icon: 'gamegold.png',
    },
    WINNER: {
        name: 'Winner',
        description: 'Have won 1 game',
        icon: 'win.png',
    },
    PRO_WINNER: {
        name: 'Pro Winner',
        description: 'Have won 10 games',
        icon: 'win2.png',
    },
    NOOB: {
        name: 'Noob',
        description: 'Have lost 1 game',
        icon: 'loser.png',
    },
    PRO_NOOB: {
        name: 'Pro Noob',
        description: 'Have lost 10 games',
        icon: 'loser2.png',
    },
    VELLA: {
        name: 'Vella',
        description: 'Have xXxD4rKV3ll4xXx as a friend',
        icon: 'redbull.png',
    },
    MESSAGE: {
        name: 'Message',
        description: 'Have sent a message to a friend',
        icon: 'chat.svg',
    },
    NO_ELO: {
        name: 'Bambi',
        description: 'Have 0 elo',
        icon: 'bambi.png',
    },
    BRONZE: {
        name: 'Habitant',
        description: 'Have 1300 elo',
        icon: 'logo_paradis.png',
    },
    SILVER: {
        name: 'Entrainement',
        description: 'Have 1600 elo',
        icon: 'bataillon1.png',
    },
    GOLD: {
        name: 'Garnison',
        description: 'Have 1900 elo',
        icon: 'bataillon2.png',
    },
    PLATINUM: {
        name: 'Brigades Speciales',
        description: 'Have 2100 elo',
        icon: 'bataillon3.png',
    },
    DIAMOND: {
        name: 'Bataillon exploration',
        description: 'Have 2500 elo',
        icon: 'bataillon4.png',
    },
    RICK_ROLL: {
        name: 'Rick Roll',
        description: 'Have been rick rolled',
        icon: 'rickroll.png',
    },
    RICK_ROLLER: {
        name: 'Rick Roller',
        description: 'Have rick rolled someone',
        icon: 'rickroller.png',
    },
};

class Achievement {
    email;
    achievement;

    constructor(email, achievement) {
        this.email = email;
        this.achievement = achievement;
    }

    // DB CRUD operations
    static async create(achievement) {
        const db = await getMongoDatabase();
        const achievements = db.collection('achievement');

        // if the achievement already exists, return an error
        return Achievement.getAchievementsByEmail(achievement.email).then((acs) => {
            if (acs.find((a) => a.achievement === achievement.achievement)) {
                return { error: 'Achievement already exists' };
            }
            return achievements.insertOne(achievement);
        });
    }

    static async getAchievementsByEmail(email) {
        const db = await getMongoDatabase();
        const achievements = db.collection('achievement');

        logger.trace(`Getting achievements for email ${email}`);

        let acvs = [];

        return achievements
            .find({ email: email })
            .forEach((acv) => {
                acvs.push(acv);
            })
            .then(() => {
                return acvs;
            });
    }

    static async getAchievementByUsername(username) {
        logger.trace(`Getting achievements for username ${username}`);
        const { User } = require('./user');
        User.getByName(username).then((user) => {
            logger.trace(`Found user: ${JSON.stringify(user)}`);

            if (!user) {
                return null;
            }

            return Achievement.getAchievementsByEmail(user.email);
        });
    }

    static async createMockData() {
        const db = await getMongoDatabase();
        const achievements = db.collection('achievement');

        return await achievements.insertMany([new Achievement('a@a.a', ACHIEVEMENT.FIRST_GAME), new Achievement('a@a.a', ACHIEVEMENT.PRO_GAMER), new Achievement('b@b.b', ACHIEVEMENT.MASTER_GAMER), new Achievement('b@b.b', ACHIEVEMENT.WINNER)]);
    }
}

module.exports = { Achievement, ACHIEVEMENT };
