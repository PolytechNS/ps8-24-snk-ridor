import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

// Broadcast Chat
const socket = io();

socket.on('connect', () => {
    console.log('Connected to socket-io server');
    socket.emit('message:send', { sender: 'client', receiver: 'server', content: 'Hello server!' });
    console.log('Sent message to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket-io server');
});

socket.on('message', (msg) => {
    console.log('Received message: ' + msg);
});

socket.connect();
