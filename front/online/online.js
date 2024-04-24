import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { BASE_URL_PAGE, HOME_URL, LOGIN_URL, ONLINE_GAME_URL } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });
    const socket = io();

    const gameList = document.getElementById('room-list');
    const createRoomButton = document.getElementById('create-room-button');
    const logoutButton = document.getElementById('logout-button');

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search rooms...';
    searchInput.classList.add('search-input');
    searchInput.addEventListener('input', searchRooms);
    gameList.parentNode.insertBefore(searchInput, gameList);

    // Get the user's email from localStorage
    const userEmail = localStorage.getItem('email');
    console.log('User email:', userEmail);

    function createRoom() {
        // generate a random room name and join it
        const room = Math.random().toString(36).substring(7);
        console.log('Emitting game:join event with user email:', room);
        socket.emit('game:join', room);
        socket.emit('game:login', userEmail);
    }
    function searchRooms() {
        const searchValue = searchInput.value.toLowerCase();
        const listItems = gameList.getElementsByTagName('li');

        for (const item of listItems) {
            const roomId = item.textContent.split(' - ')[0].toLowerCase();
            if (roomId.includes(searchValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    }

    // Log when the connection is established
    socket.on('connect', () => {
        console.log('Socket.IO connection established');

        // Fetch the rooms of available games when the page loads
        console.log('Emitting game:list event');
        socket.emit('game:list');
    });

    // Log any error that occurs
    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });

    // Handle the 'game:rooms' event to display the list of available rooms
    socket.on('game:rooms', (rooms) => {
        console.log('Received game:rooms event with games:', rooms);
        gameList.innerHTML = '';

        for (const room in rooms) {
            let room_hash = room;
            let room_info = rooms[room];

            const listItem = document.createElement('li');
            listItem.textContent = `Game ${room_hash} - Creator: ${room_info.player1}`;

            // Add join button for rooms not created by the current user
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.classList.add('join-button');
            joinButton.addEventListener('click', () => {
                joinRoom(room_hash);
            });
            listItem.appendChild(joinButton);
            gameList.appendChild(listItem);
        }

        /*rooms.forEach((room) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Game ${room.id} - Creator: ${room.creator}`;

            // Add join button for rooms not created by the current user
            if (room.creator !== userEmail) {
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join';
                joinButton.classList.add('join-button');
                joinButton.addEventListener('click', () => {
                    joinRoom(room.id);
                });
                listItem.appendChild(joinButton);
            }

            // Add delete button for rooms created by the current user
            if (room.creator === userEmail) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deleteRoom(room.id);
                });
                listItem.appendChild(deleteButton);
            }

            gameList.appendChild(listItem);
        });*/

        // Disable the create room button if the user has already created a room
        // TODO: check for each room if player 1 or player 2.
        //createRoomButton.disabled = rooms.some((room) => room.creator === userEmail);
    });

    // Handle the create room button click event
    createRoomButton.addEventListener('click', createRoom);

    // Handle the logout button click event
    logoutButton.addEventListener('click', () => {
        // Clear the stored email and redirect to the login page
        localStorage.removeItem('email');
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    });

    // Function to join a room
    function joinRoom(roomId) {
        console.log('Emitting room:join event with room ID:', roomId);
        socket.emit('game:join', roomId);
        socket.emit('game:login', userEmail);
    }

    socket.on('game:start', () => {
        // remember socket id
        localStorage.setItem('socket_id', socket.id);
        console.log('Received game:start event');
        document.location.href = BASE_URL_PAGE + ONLINE_GAME_URL;
    });
});
