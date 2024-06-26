const { getMongoDatabase } = require('./db');
const crypto = require('crypto');
const { logger } = require('../libs/logging');
const { ACHIEVEMENT, Achievement } = require('./achievements');

class User {
    name;
    email;
    password_hash;
    elo;
    games_won;
    games_lost;

    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password_hash = hashPassword(password);
        this.elo = 1000;
        this.games_won = 0;
        this.games_lost = 0;
    }

    validate_password(password) {
        return this.password_hash === hashPassword(password);
    }

    // DB CRUD operations
    static async create(user) {
        return User.getByEmail(user.email).then(async (result) => {
            if (result) {
                return { error: 'User already exists' };
            } else {
                const db = await getMongoDatabase();
                const users = db.collection('users');

                // === Achievement ===
                Achievement.create(new Achievement(user.email, ACHIEVEMENT.EXPLORER)).then((_) => {});

                return await users.insertOne(user);
            }
        });
    }

    static async getByEmail(email) {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        let user = new User('', '', '');

        return users.findOne({ email: email }).then((result) => {
            if (!result) {
                return null;
            }

            user.name = result.name;
            user.email = result.email;
            user.password_hash = result.password_hash;
            user.elo = result.elo;
            user.games_won = result.games_won;
            user.games_lost = result.games_lost;

            return user;
        });
    }

    static async getByName(name) {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        let user = new User('', '', '');

        return users.findOne({ name: name }).then((result) => {
            if (!result) {
                return null;
            }

            user.name = result.name;
            user.email = result.email;
            user.password_hash = result.password_hash;
            user.elo = result.elo;
            user.games_won = result.games_won;
            user.games_lost = result.games_lost;

            return user;
        });
    }

    static async getAll() {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        return users
            .find()
            .toArray()
            .then((result) => {
                let users_objs = [];

                result.forEach((user) => {
                    let user_obj = new User('', '', '');
                    user_obj.name = user.name;
                    user_obj.email = user.email;
                    user_obj.password_hash = user.password_hash;
                    user_obj.elo = user.elo;
                    user_obj.games_won = user.games_won;
                    user_obj.games_lost = user.games_lost;

                    users_objs.push(user_obj);
                });

                return users_objs;
            });
    }

    static async delete(email) {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        return await users.deleteOne({ email: email });
    }

    static async update(email, user) {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        logger.debug(`Updating user: ${email} with ${JSON.stringify(user)}`);

        return await users.updateOne({ email: email }, { $set: user });
    }

    static async getTop() {
        const db = await getMongoDatabase();
        const users = db.collection('users');

        return users
            .find()
            .sort({ elo: -1 })
            .limit(100)
            .toArray()
            .then((result) => {
                let users_objs = [];

                result.forEach((user) => {
                    let user_obj = new User('', '', '');
                    user_obj.name = user.name;
                    user_obj.email = user.email;
                    user_obj.elo = user.elo;
                    user_obj.games_won = user.games_won;
                    user_obj.games_lost = user.games_lost;

                    users_objs.push(user_obj);
                });

                return users_objs;
            });
    }
}

function hashPassword(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}

module.exports = { User, hashPassword };
