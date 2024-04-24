const { getMongoDatabase } = require('./db');
const { logger } = require('../libs/logging');

// Achievement ENUM
const ACHIEVEMENT = {
    FIRST_GAME: 0, // Have played 1 game // Needs Games Counter
    PRO_GAMER: 1, // Have played 10 games // Needs Games Counter
    MASTER_GAMER: 2, // Have played 100 games // Needs Won Games Counter
    WINNER: 3, // Have won 1 game // Needs Games Counter
    PRO_WINNER: 4, // Have won 10 games // Needs Games Counter
    NOOB: 5, // Have lost 1 game // Needs Games Counter
    PRO_NOOB: 6, // Have lost 10 games // Needs Games Counter
    FRIENDLY: 7, // Have played with a friend // Needs Games Counter
    SOCIAL: 8, // Have played with 10 friends // Needs Games Counter
    VELLA: 9, // Have xXx_D4rKV3ll4_xXx in friend
    ONLINE: 10, // Have played an online game
    IA: 11, // Have played an IA game
    IA_WIN: 12, // Have won an IA game // IA Games needs Auth now
    LOCAL: 13, // Have played a local game // #Front Only
    MESSAGE: 14, // Have sent a message to a friend
    EMOTE: 15, // Have used an emote
    BRONZE: 16, // Have 1300 elo
    SILVER: 17, // Have 1600 elo
    GOLD: 18, // Have 1900 elo
    PLATINUM: 19, // Have 2100 elo
    DIAMOND: 20, // Have 2500 elo
    NO_ELO: 21, // Have 0 elo
    RICK_ROLL: 22, // Have been rick rolled // Needs Modifications on messages
    RICK_ROLLER: 23, // Have rick rolled someone // Needs Modifications on messages
    RULES: 24, // Have read the rules // #Front Only
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
        // if the achievement already exists, return an error
        return Achievement.getAchievementsByEmail(achievement.email).then((acs) => {
            if (acs.find((a) => a.achievement === achievement.achievement)) {
                return { error: 'Achievement already exists' };
            }

            const db = getMongoDatabase();
            const achievements = db.collection('achievement');

            return achievements.insertOne(achievement);
        });
    }

    static async getAchievementsByEmail(email) {
        const db = await getMongoDatabase();
        const achievements = db.collection('achievement');

        try {
            return await achievements
                .find({
                    email: email,
                })
                .toArray();
        } catch (error) {
            logger.error(`Error in getAll function: ${error.message}`);
            return null;
        }
    }

    static async getAchievementByUsername(username) {
        const { User } = require('./user');
        User.getByName(username).then((user) => {
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
