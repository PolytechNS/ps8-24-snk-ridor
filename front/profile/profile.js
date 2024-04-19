import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, FRIEND_API, FRIEND_URL } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    updateProfileInfo(username, email);
    fetchFriendList(token, username);
    addEventListeners();

    function updateProfileInfo(username, email) {
        document.getElementById('profile-name').textContent = username;
        document.getElementById('profile-email').textContent = email;
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

        friendsList.innerHTML = '';
        pendingRequestsList.innerHTML = '';

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
            } else {
                console.log('yo im inside the annoying bitch else statement');
                console.log(friend.friend_name);
                if (friend.friend_name === username) {
                    listItem.textContent = friend.user_name;
                    const acceptButton = createAcceptButton(friend.user_name);
                    listItem.appendChild(acceptButton);
                    pendingRequestsList.appendChild(listItem);
                }
            }
        });
    }

    function createAcceptButton(friend_name) {
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.addEventListener('click', function () {
            acceptFriendRequest(friend_name);
        });
        return acceptButton;
    }

    function createRemoveButton(friend_name) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
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
