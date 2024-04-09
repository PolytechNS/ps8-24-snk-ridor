// Import the database connection
const { getMongoDatabase } = require('./db');

class Room {
    id;
    creator;
    joiner;

    constructor(id, creator, joiner = '') {
        this.id = id;
        this.creator = creator;
        this.joiner = joiner;
    }

    // DB CRUD operations
    static async create(room) {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.insertOne(room);
    }

    static async get(id) {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.findOne({ id: id });
    }

    static async getAll() {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.find().toArray();
    }

    static async delete(id) {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.deleteOne({ id: id });
    }

    static async join(id, joiner) {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.updateOne({ id: id }, { $set: { joiner: joiner } });
    }
    static async getAvailableRooms() {
        const db = await getMongoDatabase();
        const rooms = db.collection('rooms');

        return rooms.find({ joiner: '' }).toArray();
    }
}

module.exports = { Room };
