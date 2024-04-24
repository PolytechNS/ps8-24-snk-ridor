import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, PROFILE_URL } from '../util/path.js';
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

    fetchAchievements(token, username);
    fetchMe(token, username);

    function fetchAchievements() {
        fetch(BASE_URL_API + API_URL + 'achievements/all', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayAchievements(data);
            })
            .catch((error) => {
                console.error('Error during leaderboard retrieval:', error);
            });
    }

    function fetchMe() {
        fetch(BASE_URL_API + API_URL + 'achievements/me', {
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
            throw new Error(`Achievements retriever error: ${response.status}`);
        }
    }

    function displayAchievements(data) {
        console.log(data);
        let achievementsList = document.getElementById('achievements');
        let text = '<h1>Achievements</h1><br><ul>';

        for (let i = 0; i < data.length; i++) {
            let element = data[i];
            const listItem = document.createElement('li');
            listItem.textContent = `${i + 1}. ${element.icon} ${element.name} - ${element.description}`;
            text += listItem.outerHTML;
        }

        text += '</ul>';
        achievementsList.innerHTML = text;
    }

    function displayMe(data) {
        console.log(data);
    }
});
