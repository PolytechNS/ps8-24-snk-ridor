import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, FRIEND_API, FRIEND_URL, PROFILE_URL } from '../util/path.js';
// /api/achievements/all
// /api/achievements/me

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        if (localStorage.getItem('returnPage') === 'profile') {
            window.location.replace(BASE_URL_PAGE + PROFILE_URL);
            localStorage.removeItem('returnPage');
        } else {
            window.location.replace(BASE_URL_PAGE + HOME_URL);
        }
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
        let leaderboardList = document.getElementById('leaderboard');
        let text = '<h1>Leaderboard</h1><br><ul>';

        for (let i = 0; i < data.length; i++) {
            let element = data[i];
            const listItem = document.createElement('li');
            listItem.textContent = `${i + 1}. ${element.name} - ${element.elo}`;
            text += listItem.outerHTML;
        }

        text += '</ul>';
        leaderboardList.innerHTML = text;
    }

    function displayMe(data) {
        console.log(data);
    }
});
