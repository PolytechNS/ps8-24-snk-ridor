import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { BASE_URL_PAGE, ONLINE_URL, LOGIN_URL, ONLINE_GAME_URL, RULES_URL, BASE_URL_API } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    // add event listeners to react on user input
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + ONLINE_URL);
    });

    document.getElementById('rules-button').addEventListener('click', () => {
        localStorage.setItem('returnPage', 'online');
        window.location.replace(BASE_URL_PAGE + RULES_URL);
    });

    document.getElementById('retour-button').addEventListener('click', () => {
        localStorage.setItem('returnPage', 'online');
        window.location.replace(BASE_URL_PAGE + ONLINE_URL);
    });

    // initialize socket.io
    const socket = io();

    // Interact with the HTML elements of the page
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
    const userEmail = localStorage.getItem('username');

    // utility functions
    function createRoom() {
        // generate a random room name and join it
        const room = Math.random().toString(36).substring(7);
        socket.emit('game:join', room);
        socket.emit('game:login', userEmail);
        // Create the chat room ID based on the game room ID
        const chatRoomId = `chat_${room}`;
        localStorage.setItem('chat_room_id', chatRoomId);
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

    // Interact with the server through socket.io
    socket.on('connect', () => {
        // Fetch the rooms of available games when the page loads
        socket.emit('game:list');
    });

    // Log any error that occurs
    socket.on('connect_error', (error) => {});

    // Handle the 'game:rooms' event to display the list of available rooms
    socket.on('game:rooms', (rooms) => {
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
    });
    socket.on('game:info', (data) => {
        console.log('Received game info:', data);
        // Extract the player information from the received data
        const opponentName = data.opponentName;
        const opponentElo = data.opponentElo;
        localStorage.setItem('opponentName', opponentName);
        localStorage.setItem('opponentElo', opponentElo);
    });

    // Handle the logout button click event
    logoutButton.addEventListener('click', () => {
        // Clear the stored email and redirect to the login page
        localStorage.removeItem('email');
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    });

    // Function to join a room
    function joinRoom(roomId) {
        socket.emit('game:join', roomId);
        socket.emit('game:login', userEmail);
        // join chat room
        const chatRoomId = `chat_${roomId}`;
        localStorage.setItem('chat_room_id', chatRoomId);
    }

    // Handle the 'game:start' event to redirect to the game page
    socket.on('game:start', () => {
        // remember socket id
        localStorage.setItem('socket_id', socket.id);
        document.location.href = BASE_URL_PAGE + ONLINE_GAME_URL;
    });

    // retrieve the saved games
    // /api/games_storage/list
    function fetchGames() {
        fetch(BASE_URL_API + 'games_storage/list', {
            method: 'GET',
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                console.log(data);
                displayGames(data);
            })
            .catch((error) => {
                console.error('Error during game list retrieval:', error);
            });
    }

    function displayGames(data) {
        const gamesList = document.getElementById('games-list');
        gamesList.innerHTML = '';

        for (const game of data) {
            const listItem = document.createElement('li');
            listItem.textContent = game.name;
            gamesList.appendChild(listItem);
        }
    }

    fetchGames();
});
