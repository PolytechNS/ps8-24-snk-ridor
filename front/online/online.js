import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = '../home/home.html';
    });
    const socket = io();

    const roomList = document.getElementById('room-list');
    const createRoomButton = document.getElementById('create-room-button');
    const logoutButton = document.getElementById('logout-button');

    // Get the user's email from localStorage
    const userEmail = localStorage.getItem('email');
    console.log('User email:', userEmail);

    // Log when the connection is established
    socket.on('connect', () => {
        console.log('Socket.IO connection established');
        // Emit the 'room:login' event with the user's email
        socket.emit('room:login', userEmail);
    });

    // Log any error that occurs
    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });

    // Fetch the list of available rooms when the page loads
    console.log('Emitting room:list event');
    socket.emit('room:list');

    // Handle the 'room:list' event to display the list of available rooms
    socket.on('room:list', (rooms) => {
        console.log('Received room:list event with rooms:', rooms);
        roomList.innerHTML = '';

        rooms.forEach((room) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Room ${room.id} - Creator: ${room.creator}`;

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

            roomList.appendChild(listItem);
        });

        // Disable the create room button if the user has already created a room
        createRoomButton.disabled = rooms.some((room) => room.creator === userEmail);
    });

    // Handle the 'room:created' event to add the newly created room to the list
    socket.on('room:created', (room) => {
        console.log('Received room:created event with room:', room);
        const listItem = document.createElement('li');
        listItem.textContent = `Room ${room.id} - Creator: ${room.creator}`;
        console.log('List item text content:', listItem.textContent);
        listItem.addEventListener('click', () => {
            joinRoom(room.id);
        });
        roomList.appendChild(listItem);

        // Disable the create room button after creating a room
        createRoomButton.disabled = true;
    });

    // Handle the create room button click event
    createRoomButton.addEventListener('click', () => {
        console.log('Emitting room:create event with user email:', userEmail);
        socket.emit('room:create', userEmail);
    });

    // Handle the logout button click event
    logoutButton.addEventListener('click', () => {
        // Clear the stored email and redirect to the login page
        localStorage.removeItem('email');
        window.location.href = '../login/login.html';
    });

    // Function to join a room
    function joinRoom(roomId) {
        console.log('Emitting room:join event with room ID:', roomId);
        socket.emit('room:join', { roomId, joiner: userEmail });
    }

    // Function to delete a room
    function deleteRoom(roomId) {
        console.log('Emitting room:delete event with room ID:', roomId);
        socket.emit('room:delete', roomId);
    }

    // Handle the 'room:joined' event to redirect to the game page
    socket.on('room:joined', ({ roomId, joiner }) => {
        console.log('Received room:joined event with room ID:', roomId, 'and joiner:', joiner);
        if (joiner === userEmail) {
            // Redirect to the game page with the room ID as a query parameter
            window.location.href = `../game/game.html?roomId=${roomId}`;
        }
    });

    // Handle the 'room:deleted' event to remove the deleted room from the list
    socket.on('room:deleted', (roomId) => {
        console.log('Received room:deleted event with room ID:', roomId);
        const deletedRoom = document.querySelector(`li[data-room-id="${roomId}"]`);
        if (deletedRoom) {
            deletedRoom.remove();
        }
        // Enable the create room button after deleting a room
        createRoomButton.disabled = false;
    });

    // Handle the 'error' event to display an error message
    socket.on('error', (message) => {
        console.error('Received error event with message:', message);
        alert(message);
    });
});
