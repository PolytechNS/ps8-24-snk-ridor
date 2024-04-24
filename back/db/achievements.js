const { getMongoDatabase } = require('./db');
const { logger } = require('../libs/logging');
const { User } = require('./user');

// Achievement ENUM
const ACHIEVEMENT = {
    FIRST_GAME: 0, // Have played 1 game
    PRO_GAMER: 1, // Have played 10 games
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
        return Achievement.getAll(achievement.email).then((acs) => {
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
        User.getByName(username).then((user) => {
            if (!user) {
                return null;
            }

            return Achievement.getAchievementsByEmail(user.email);
        });
    }
}

module.exports = { Achievement, ACHIEVEMENT };
