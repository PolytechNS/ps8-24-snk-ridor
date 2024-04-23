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
            listItem.textContent = `${index + 1}. ${entry.user_name} - ${entry.elo}`;
            leaderboardList.appendChild(listItem);
        });
    }

    function displayMe(data) {
        console.log(data);
    }
});
