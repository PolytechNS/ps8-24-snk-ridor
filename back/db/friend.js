const { getMongoDatabase } = require('./db');
const { User } = require('./user');

const FRIEND_STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
};

class Friend {
    user_name;
    friend_name;
    status;

    constructor(user_name, friend_name, status = FRIEND_STATUS.PENDING) {
        this.user_name = user_name;
        this.friend_name = friend_name;
        this.status = status;
    }

    // DB CRUD operations
    static async create(friend) {
        return Friend.get(friend.user_name, friend.friend_name).then(async (result) => {
            if (result) {
                return { error: 'Friend already exists' };
            } else {
                const db = await getMongoDatabase();
                const friends = db.collection('friends');

                return await friends.insertOne(friend);
            }
        });
    }

    static async get(user_name, friend_name) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        let friend = new Friend('', '', FRIEND_STATUS.PENDING);

        return friends
            .findOne({
                $or: [
                    { user_name: user_name, friend_name: friend_name },
                    { user_name: friend_name, friend_name: user_name },
                ],
            })
            .then((result) => {
                if (!result) {
                    return null;
                }

                friend.user_name = result.user_name;
                friend.friend_name = result.friend_name;
                friend.status = result.status;

                return friend;
            });
    }

    static async getAll(user_name) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return friends
            .find({ $or: [{ user_name: user_name }, { friend_name: user_name }] })
            .toArray()
            .then((result) => {
                let friends_objs = [];

                result.forEach((friend) => {
                    let friend_obj = new Friend('', '', FRIEND_STATUS.PENDING);
                    friend_obj.user_name = friend.user_name;
                    friend_obj.friend_name = friend.friend_name;
                    friend_obj.status = friend.status;

                    friends_objs.push(friend_obj);
                });

                return friends_objs;
            });
    }

    static async delete(user_name, friend_name) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return friends.deleteOne({
            $or: [
                { user_name: user_name, friend_name: friend_name },
                { user_name: friend_name, friend_name: user_name },
            ],
        });
    }

    static async updateStatus(user_name, friend_name, status) {
        const db = await getMongoDatabase();
        const friends = db.collection('friends');

        return await friends.updateOne(
            {
                $or: [
                    { user_name: user_name, friend_name: friend_name },
                    { user_name: friend_name, friend_name: user_name },
                ],
            },
            { $set: { status: status } }
        );
    }
}

module.exports = { Friend, FRIEND_STATUS };
