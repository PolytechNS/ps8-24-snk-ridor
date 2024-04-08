const { getMongoDatabase } = require('./db');
const { User } = require('./user');

const FRIEND_STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
};

class Friend {
    user_email;
    friend_email;
    status;

    constructor(user_email, friend_email, status = FRIEND_STATUS.PENDING) {
        this.user_email = user_email;
        this.friend_email = friend_email;
        this.status = status;
    }

    // DB CRUD operations
    static async create(friend) {
        return Friend.get(friend.user_email, friend.friend_email).then(async (result) => {
            if (result) {
                return { error: 'Friend already exists' };
            } else {
                const db = await getMongoDatabase();
                const friends = db.collection('friends');

                return await friends.insertOne(friend);
            }
        });
    }

    static async get(user_email, friend_email) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        let friend = new Friend('', '', FRIEND_STATUS.PENDING);

        return friends
            .findOne({
                $or: [
                    { user_email: user_email, friend_email: friend_email },
                    { user_email: friend_email, friend_email: user_email },
                ],
            })
            .then((result) => {
                if (!result) {
                    return null;
                }

                friend.user_email = result.user_email;
                friend.friend_email = result.friend_email;
                friend.status = result.status;

                return friend;
            });
    }

    static async getAll(user_email) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return friends
            .find({ $or: [{ user_email: user_email }, { friend_email: user_email }] })
            .toArray()
            .then((result) => {
                let friends_objs = [];

                result.forEach((friend) => {
                    let friend_obj = new Friend('', '', FRIEND_STATUS.PENDING);
                    friend_obj.user_email = friend.user_email;
                    friend_obj.friend_email = friend.friend_email;
                    friend_obj.status = friend.status;

                    friends_objs.push(friend_obj);
                });

                return friends_objs;
            });
    }

    static async delete(user_email, friend_email) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return friends.deleteOne({
            $or: [
                { user_email: user_email, friend_email: friend_email },
                { user_email: friend_email, friend_email: user_email },
            ],
        });
    }

    static async updateStatus(user_email, friend_email, status) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return await friends.updateOne({ user_email: user_email, friend_email: friend_email }, { $set: { status: status } });
    }
}

module.exports = { Friend, FRIEND_STATUS };
