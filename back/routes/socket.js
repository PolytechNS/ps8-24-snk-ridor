const { io } = require('../index.js');
const chat = require('./chat');

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (msg) => {
        chat.handleSocket(msg, socket);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
