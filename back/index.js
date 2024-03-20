// The http module contains methods to handle http queries.
const http = require('http');
// Let's import our logic.
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');

const PORT = process.env.PORT || 8000;

/* The http module contains a createServer function, which takes one argument, which is the function that
 ** will be called whenever a new request arrives to the server.
 */
const server = http
    .createServer(function (request, response) {
        // First, let's check the URL to see if it's a REST request or a file request.
        // We will remove all cases of "../" in the url for security purposes.
        let filePath = request.url.split('/').filter(function (elem) {
            return elem !== '..';
        });

        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', '*');
        response.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        );
        response.setHeader('Access-Control-Allow-Credentials', 'true');

        try {
            // If the URL starts by /api, then it's a REST request (you can change that if you want).
            if (filePath[1] === 'api') {
                apiQuery.manage(request, response);
                // If it doesn't start by /api, then it's a request for a file.
            } else {
                fileQuery.manage(request, response);
            }
        } catch (error) {
            console.log(`error while processing ${request.url}: ${error}`);
            response.statusCode = 400;
            response.end(
                `Something in your request (${request.url}) is strange...`
            );
        }
        // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
    })
    .listen(PORT);

// We need to create a socket.io server to handle the multiplayer.
const io = require('socket.io')(server);

console.log(`Server running at http://localhost:${PORT}/`);

exports.io = io;
