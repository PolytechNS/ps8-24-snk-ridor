const { getMongoDatabase } = require('./db');
const { logger } = require('../libs/logging');

const ACHIEVEMENT = {
    FIRST_GAME: {
        name: 'First Game',
        description: 'Have played 1 game',
        icon: 'gamepad.png',
    },
    PRO_GAMER: {
        name: 'Pro Gamer',
        description: 'Have played 10 games',
        icon: 'pro-gamer.png',
    },
    MASTER_GAMER: {
        name: 'Master Gamer',
        description: 'Have played 100 games',
        icon: 'master-gamer.png',
    },
    WINNER: {
        name: 'Winner',
        description: 'Have won 1 game',
        icon: 'winner.png',
    },
    PRO_WINNER: {
        name: 'Pro Winner',
        description: 'Have won 10 games',
        icon: 'pro-winner.png',
    },
    NOOB: {
        name: 'Noob',
        description: 'Have lost 1 game',
        icon: 'noob.png',
    },
    PRO_NOOB: {
        name: 'Pro Noob',
        description: 'Have lost 10 games',
        icon: 'pro-noob.png',
    },
    FRIENDLY: {
        name: 'Friendly',
        description: 'Have played with a friend',
        icon: 'friendly.png',
    },
    SOCIAL: {
        name: 'Social',
        description: 'Have played with 10 friends',
        icon: 'social.png',
    },
    VELLA: {
        name: 'Vella',
        description: 'Have xXx_D4rKV3ll4_xXx in friend',
        icon: 'vella.png',
    },
    ONLINE: {
        name: 'Online',
        description: 'Have played an online game',
        icon: 'online.png',
    },
    IA: {
        name: 'IA',
        description: 'Have played an IA game',
        icon: 'ia.png',
    },
    IA_WIN: {
        name: 'IA Win',
        description: 'Have won an IA game',
        icon: 'ia-win.png',
    },
    LOCAL: {
        name: 'Local',
        description: 'Have played a local game',
        icon: 'local.png',
    },
    MESSAGE: {
        name: 'Message',
        description: 'Have sent a message to a friend',
        icon: 'message.png',
    },
    EMOTE: {
        name: 'Emote',
        description: 'Have used an emote',
        icon: 'emote.png',
    },
    BRONZE: {
        name: 'Bronze',
        description: 'Have 1300 elo',
        icon: 'bronze.png',
    },
    SILVER: {
        name: 'Silver',
        description: 'Have 1600 elo',
        icon: 'silver.png',
    },
    GOLD: {
        name: 'Gold',
        description: 'Have 1900 elo',
        icon: 'gold.png',
    },
    PLATINUM: {
        name: 'Platinum',
        description: 'Have 2100 elo',
        icon: 'platinum.png',
    },
    DIAMOND: {
        name: 'Diamond',
        description: 'Have 2500 elo',
        icon: 'diamond.png',
    },
    NO_ELO: {
        name: 'No Elo',
        description: 'Have 0 elo',
        icon: 'no-elo.png',
    },
    RICK_ROLL: {
        name: 'Rick Roll',
        description: 'Have been rick rolled',
        icon: 'rick-roll.png',
    },
    RICK_ROLLER: {
        name: 'Rick Roller',
        description: 'Have rick rolled someone',
        icon: 'rick-roller.png',
    },
    RULES: {
        name: 'Rules',
        description: 'Have read the rules',
        icon: 'rules.png',
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
