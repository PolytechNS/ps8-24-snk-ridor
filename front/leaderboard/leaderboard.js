import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, FRIEND_API, FRIEND_URL } from '../util/path.js';
// /api/leaderboard/top
// /api/leaderboard/me

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const elo = localStorage.getItem('elo');

    fetchLeaderboard(token, username);
    fetchMe(token, username);

    function fetchLeaderboard() {
        fetch(BASE_URL_API + API_URL + 'leaderboard/top', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayLeaderboard(data);
            })
            .catch((error) => {
                console.error('Error during leaderboard retrieval:', error);
            });
    }

    function fetchMe() {
        fetch(BASE_URL_API + API_URL + 'leaderboard/me', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayMe(data);
            })
            .catch((error) => {
                console.error('Error during me retrieval:', error);
            });
    }

    function handleResponse(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Leaderboard retriever error: ${response.status}`);
        }
    }

    function displayLeaderboard(data) {
        console.log(data);
        const leaderboardList = document.getElementById('leaderboard');
        leaderboardList.innerHTML = '';

        data.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${entry.name} - ${entry.elo}`;
            leaderboardList.appendChild(listItem);
        });
    }

    function populateLeaderboard() {
        const podium = document.getElementById('podium');
        const userList = document.getElementById('userList');

        // Clear existing content
        podium.innerHTML = '';
        userList.innerHTML = '';

        // Populate podium
        for (let i = 0; i < 3; i++) {
            const user = leaderboardData[i];
            const userElement = createUserElement(user);
            podium.appendChild(userElement);
        }

        // Populate user list
        for (let i = 3; i < leaderboardData.length; i++) {
            const user = leaderboardData[i];
            const userElement = createUserElement(user);
            userList.appendChild(userElement);
        }
    }

    // Function to create user element
    function createUserElement(user) {
        const userElement = document.createElement('li');
        userElement.classList.add('user');
        userElement.innerHTML = `
    <img src="${user.avatar}" alt="${user.name}">
    <span>${user.name}</span>
    <span>${user.score}</span>
  `;
        return userElement;
    }

    function displayMe(data) {
        console.log(data);
    }
});
