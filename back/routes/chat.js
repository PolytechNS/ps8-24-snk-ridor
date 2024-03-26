function handleSocket(msg, socket) {
    console.log('message: ' + msg);
    socket.broadcast.emit('message', msg);
}

module.exports = { handleSocket };
