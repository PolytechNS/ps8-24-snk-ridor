const { logger } = require('../libs/logging');
const { getMongoDatabase } = require('./db');

class PrivateMessage {
    sender;
    receiver;
    message;
    timestamp;

    constructor(sender, receiver, message) {
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
        this.timestamp = new Date();
    }

    // DB CRUD operations
    static async create(privateMessage) {
        const db = await getMongoDatabase();
        const privateMessages = db.collection('privateMessages');

        let mp = new PrivateMessage(privateMessage.sender, privateMessage.receiver, privateMessage.message);

        return await privateMessages.insertOne({
            sender: mp.sender,
            receiver: mp.receiver,
            message: mp.message,
            timestamp: mp.timestamp,
        });
    }

    static async get(sender, receiver, limit = 100) {
        const db = await getMongoDatabase();
        const privateMessages = db.collection('privateMessages');

        // Find all messages between two users in date order with a limit of 100 messages
        return privateMessages
            .find({
                $or: [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, receiver: sender },
                ],
            })
            .sort({ timestamp: 1 })
            .limit(limit)
            .toArray();
    }
}

module.exports = { PrivateMessage };
