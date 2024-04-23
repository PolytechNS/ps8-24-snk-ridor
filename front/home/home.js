import { BASE_URL_PAGE, LOGIN_URL } from '/util/path.js';
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    });
});

function joinAI() {
    const socket = io();

    // Log when the connection is established
    socket.on('connect', () => {
        console.log('Socket.IO connection established');

        // generate a random room name and join it
        const room = Math.random().toString(36).substring(7);
        console.log('Emitting game:join event with user email:', room);
        socket.emit('game:join', room);
        socket.emit('game:ai');
    });

    // Log any error that occurs
    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });
}
