const { MongoClient } = require('mongodb');
const { logger } = require('../libs/logging');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

logger.info(`Connecting to MongoDB at ${MONGO_URL}`);

const client = new MongoClient(MONGO_URL, { connectTimeoutMS: 2000 });

async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }

    logger.debug('Successfully retrieved MongoDB client');

    return client.db('quoridor');
}

module.exports = { getMongoDatabase };
