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

    // Global variable to hold the achievements the user has obtained
    let obtainedAchievements = [];

    fetchMe(token);

    function fetchAchievements() {
        fetch(BASE_URL_API + API_URL + 'achievements/all', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayAchievements(data, obtainedAchievements);
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
                obtainedAchievements = data.map((achievement) => achievement.achievement.name);
                displayMe();
                fetchAchievements();
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

    function displayAchievements(data, obtainedAchievements) {
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

            // Check if the user has obtained the achievement
            const isObtained = obtainedAchievements.includes(achievement.name);

            // Apply grayscale filter if the achievement has not been obtained
            icon.style.filter = isObtained ? 'none' : 'grayscale(100%)';

            // Create a modal container for the achievement details
            const modal = document.createElement('div');
            modal.className = 'achievement-modal';

            // Add the title to the modal
            const modalTitle = document.createElement('h3');
            modalTitle.textContent = achievement.name;
            modalTitle.className = 'modal-title';

            // Add the icon to the modal
            const modalIcon = document.createElement('img');
            modalIcon.src = `../resources/achievements/${achievement.icon}`;
            modalIcon.alt = `${achievement.name} icon`;
            modalIcon.className = 'modal-icon';

            // Add the description to the modal
            const modalDesc = document.createElement('p');
            modalDesc.textContent = achievement.description;
            modalDesc.className = 'modal-desc';

            // Append all the elements to the modal
            modal.appendChild(modalTitle);
            modal.appendChild(modalIcon);
            modal.appendChild(modalDesc);

            // Append the modal to the card
            card.appendChild(modal);

            // Show modal on hover
            card.addEventListener('mouseenter', () => {
                const cardRect = card.getBoundingClientRect();
                modal.style.display = 'block';

                // Check if the card is in the last row by comparing it with the window's height
                if (cardRect.bottom + modal.offsetHeight > window.innerHeight) {
                    // Position the tooltip above the card
                    modal.style.top = `${cardRect.top - modal.offsetHeight}px`;
                    modal.style.transform = 'translateY(-20%)'; // Adjust upwards
                } else {
                    // Position the tooltip below the card
                    modal.style.top = `${cardRect.bottom}px`;
                    modal.style.transform = 'translateY(0%)'; // Normal position
                }

                // Adjust the left position to ensure the tooltip doesn't go off the right side of the screen
                if (cardRect.left + modal.offsetWidth > window.innerWidth) {
                    modal.style.left = `auto`;
                    modal.style.right = `10px`;
                } else {
                    modal.style.left = `${cardRect.left + window.scrollX}px`;
                    modal.style.right = `auto`;
                }
            });

            // Hide modal when not hovered over
            card.addEventListener('mouseleave', () => {
                modal.style.display = 'none';
            });

            grid.appendChild(card);
            card.appendChild(icon);
            card.appendChild(name);
        });

        achievementsList.innerHTML = '';
        achievementsList.appendChild(title);
        achievementsList.appendChild(grid);
    }

    function displayMe() {
        console.log('My Achievements : ' + obtainedAchievements);
    }
});
