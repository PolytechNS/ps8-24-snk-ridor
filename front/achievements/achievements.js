import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, PROFILE_URL } from '../util/path.js';
// /api/achievements/all
// /api/achievements/me
// /api/achievements/completion

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
        const achievementsList = document.getElementById('achievements');

        const title = document.createElement('h1');
        title.textContent = 'Achievements';
        title.className = 'achievements-title';

        const grid = document.createElement('div');
        grid.className = 'grid';

        Object.values(data).forEach((achievement, index) => {
            if (index >= 18) return;

            const card = document.createElement('div');
            card.className = 'card';

            const icon = document.createElement('img');
            icon.src = `../resources/achievements/${achievement.icon}`;
            icon.alt = `${achievement.name} icon`;
            icon.className = 'icon';

            const name = document.createElement('p');
            name.textContent = achievement.name;
            name.className = 'name';

            card.appendChild(icon);
            card.appendChild(name);
            grid.appendChild(card);
        });

        achievementsList.innerHTML = '';
        achievementsList.appendChild(title);
        achievementsList.appendChild(grid);
    }

    function displayMe(data) {
        console.log(data);
    }
});
