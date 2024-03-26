const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

const client = new MongoClient(MONGO_URL);

async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }

    return client.db('quoridor');
}

module.exports = { getMongoDatabase };
