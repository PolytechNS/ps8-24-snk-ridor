const http = require('http');
// const { Server } = require("socket.io");

const { logger } = require('./libs/logging');

// routes
const api = require('./routes/api.js');
const front = require('./routes/front/front.js');

const PORT = process.env.PORT || 8000;

const server = http
    .createServer(function (request, response) {
        let filePath = request.url.split('/').filter(function (elem) {
            return elem !== '..';
        });

        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', '*');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.setHeader('Access-Control-Allow-Credentials', 'true');

        try {
            if (filePath[1] === 'api') {
                logger.info(`API request: ${request.url}`);
                api.manageRequest(request, response);
            } else {
                logger.info(`Front request: ${request.url}`);
                front.manageRequest(request, response);
            }
        } catch (error) {
            console.log(`error while processing ${request.url}: ${error}`);
            response.statusCode = 400;
            response.end(`Something in your request (${request.url}) is strange...`);
        }
    })
    .listen(PORT);

// export const io = Server(server);

logger.info(`Server running at http://localhost:${PORT}/`);
