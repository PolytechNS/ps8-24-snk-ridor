import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, FRIEND_API, FRIEND_URL, LEADERBOARD_URL, ACHIEVEMENTS_URL } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    // add event listeners to react on user input
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });

    document.getElementById('leaderboard-btn').addEventListener('click', () => {
        leaderboardClick();
    });

    document.getElementById('achievements-btn').addEventListener('click', () => {
        achievementsClick();
    });

    // get user data from local storage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const elo = localStorage.getItem('elo');

    // update profile info
    fetchMe();
    fetchFriendList(token, username);
    addEventListeners();

    // utility functions
    function updateProfileInfo(data) {
        document.getElementById('profile-name').textContent = data.username;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-elo').textContent = data.elo;
    }

    function fetchFriendList(token, username) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'list', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayFriendList(data, username);
            })
            .catch((error) => {
                console.error('Error during friend list retrieval:', error);
            });
    }

    function fetchMe() {
        let username = '';
        let email = '';
        let elo = '';

        fetch(BASE_URL_API + API_URL + 'leaderboard/me', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                username = data.name;
                email = data.email;
                elo = data.elo;
                updateProfileInfo({ username, email, elo });
            })
            .catch((error) => {
                console.error('Error during me retrieval:', error);
            });
    }

    function handleResponse(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Friend list retrieval failed with status: ${response.status}`);
        }
    }

    function displayFriendList(data, username) {
        const friendsList = document.getElementById('friends-list');
        const pendingRequestsList = document.getElementById('pending-requests-list');
        const friendsContainer = document.getElementById('friends-container');
        const pendingRequestsContainer = document.getElementById('pending-requests-container');

        friendsList.innerHTML = '';
        pendingRequestsList.innerHTML = '';

        let hasFriends = false;
        let hasPendingRequests = false;

        data.forEach((friend) => {
            const listItem = document.createElement('li');

            if (friend.status === 1) {
                if (friend.user_name === username) {
                    listItem.textContent = friend.friend_name;
                } else {
                    listItem.textContent = friend.user_name;
                }
                const removeButton = createRemoveButton(listItem.textContent);
                listItem.appendChild(removeButton);
                friendsList.appendChild(listItem);
                hasFriends = true;
            } else {
                if (friend.friend_name === username) {
                    listItem.textContent = friend.user_name;
                    const acceptButton = createAcceptButton(friend.user_name);
                    listItem.appendChild(acceptButton);
                    pendingRequestsList.appendChild(listItem);
                    hasPendingRequests = true;
                }
            }
        });

        if (hasFriends) {
            friendsContainer.style.display = 'block';
        } else {
            friendsContainer.style.display = 'none';
        }

        if (hasPendingRequests) {
            pendingRequestsContainer.style.display = 'block';
        } else {
            pendingRequestsContainer.style.display = 'none';
        }
    }

    function createAcceptButton(friend_name) {
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accepter';
        acceptButton.addEventListener('click', function () {
            acceptFriendRequest(friend_name);
        });
        return acceptButton;
    }

    function createRemoveButton(friend_name) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Supprimer';
        removeButton.addEventListener('click', function () {
            removeFriend(friend_name);
        });
        return removeButton;
    }

    function addEventListeners() {
        const addFriendBtn = document.getElementById('add-friend-btn');
        addFriendBtn.addEventListener('click', function () {
            window.location.replace(BASE_URL_PAGE + FRIEND_URL);
        });
    }

    function acceptFriendRequest(friend_name) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
            body: JSON.stringify({ friend_name: friend_name }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log('Friend request accepted');
                    window.location.reload();
                } else {
                    throw new Error(`Friend request acceptance failed with status: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error('Error during friend request acceptance:', error);
            });
    }

    function removeFriend(friend_name) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
            body: JSON.stringify({ friend_name: friend_name }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log('Friend removed');
                    window.location.reload();
                } else {
                    throw new Error(`Friend removal failed with status: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error('Error during friend removal:', error);
            });
    }
});

function leaderboardClick() {
    localStorage.setItem('returnPage', 'profile');
    window.location.replace(BASE_URL_PAGE + LEADERBOARD_URL);
}

function achievementsClick() {
    localStorage.setItem('returnPage', 'profile');
    window.location.replace(BASE_URL_PAGE + ACHIEVEMENTS_URL);
}
