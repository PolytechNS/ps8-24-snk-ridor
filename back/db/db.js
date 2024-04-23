const { MongoClient } = require('mongodb');
const { logger } = require('../libs/logging');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

// if mongo url contains the password, replace it with '***'

if (MONGO_URL.includes('@')) {
    const urlParts = MONGO_URL.split('@');
    let password;
    if (urlParts.length === 2) {
        password = urlParts[0].split(':')[2];
    } else if (urlParts.length === 3) {
        password = urlParts[1].split(':')[2];
    }
    const maskedPassword = '*'.repeat(5);
    logger.info(`${urlParts[0].replace(password, maskedPassword)}@${urlParts[1]}`);
} else {
    logger.info(`Connecting to MongoDB at ${MONGO_URL}`);
}

const client = new MongoClient(MONGO_URL, { connectTimeoutMS: 2000 });

async function getMongoDatabase() {
    if (!!client && !!client.topology && client.topology.isConnected()) {
        await client.connect();
    }

    logger.debug('Successfully retrieved MongoDB client');

    return client.db('quoridor');
}

module.exports = { getMongoDatabase };
