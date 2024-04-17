import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, FRIEND_API, FRIEND_URL } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    });
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    updateProfileInfo(username, email);
    fetchFriendList(token, email);
    addEventListeners();

    function updateProfileInfo(username, email) {
        document.getElementById('profile-name').textContent = username;
        document.getElementById('profile-email').textContent = email;
    }

    function fetchFriendList(token, email) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'list', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then(handleResponse)
            .then((data) => {
                displayFriendList(data, email);
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

    function displayFriendList(data, email) {
        const friendsList = document.getElementById('friends-list');
        const pendingRequestsList = document.getElementById('pending-requests-list');

        data.forEach((friend) => {
            const listItem = document.createElement('li');
            listItem.textContent = friend.user_email;

            if (friend.status === 1) {
                if (friend.user_email === email) {
                    listItem.textContent = friend.friend_email;
                }
                const removeButton = createRemoveButton(listItem.textContent);
                listItem.appendChild(removeButton);
                friendsList.appendChild(listItem);
            } else if (friend.friend_email === email) {
                listItem.textContent = friend.user_email;
                const acceptButton = createAcceptButton(friend.user_email);
                listItem.appendChild(acceptButton);
                pendingRequestsList.appendChild(listItem);
            }
        });
    }

    function createAcceptButton(friend_email) {
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.addEventListener('click', function () {
            acceptFriendRequest(friend_email);
        });
        return acceptButton;
    }

    function createRemoveButton(friend_email) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', function () {
            removeFriend(friend_email);
        });
        return removeButton;
    }

    function addEventListeners() {
        const addFriendBtn = document.getElementById('add-friend-btn');
        addFriendBtn.addEventListener('click', function () {
            window.location.replace(BASE_URL_PAGE + FRIEND_URL);
        });
    }

    function acceptFriendRequest(friend_email) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
            body: JSON.stringify({ friend_email: friend_email }),
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

    function removeFriend(friend_email) {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
            body: JSON.stringify({ friend_email: friend_email }),
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
