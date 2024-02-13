const { io } = require('../index.js');

// Broadcast Chat
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat', msg);
    });
});
