import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

// Broadcast Chat
const socket = io();

socket.connect();

socket.on('connect', () => {
    console.log('Connected to socket-io server');
    socket.emit('message', { sender: 'client', receiver: 'server', content: 'Hello server!' });
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket-io server');
});

socket.on('message', (msg) => {
    console.log('Received message: ' + msg);
});

socket.on('broadcast-chat', (msg) => {
    let messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = '<div class="message-content"></div>';
    let content = messageElement.getElementsByClassName('message-content')[0];
    content.textContent = msg;
    let chatbox = document.getElementById('chatbox-content');
    chatbox.appendChild(messageElement);
});

socket.emit('broadcast-chat', 'Hello world!');

function sendMessage() {
    let input = document.getElementById('chatbox-input-text');
    let message = input.value;
    if (message === '') {
        return;
    }

    socket.emit('chat', message);

    let messageElement = document.createElement('div');
    messageElement.className = 'message self';
    messageElement.innerHTML = '<div class="message-content"></div>';
    let content = messageElement.getElementsByClassName('message-content')[0];
    content.textContent = message;
    let chatbox = document.getElementById('chatbox-content');
    chatbox.appendChild(messageElement);
    input.value = '';
}

document.getElementById('chatbox-input-send').addEventListener('click', sendMessage);

document.getElementById('chatbox-input-text').addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
        sendMessage();
    }
});
