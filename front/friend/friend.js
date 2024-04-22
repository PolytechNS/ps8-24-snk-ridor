import { BASE_URL_API, BASE_URL_PAGE, API_URL, FRIEND_API, PROFILE_URL } from '../util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', function () {
        window.location.replace(BASE_URL_PAGE + PROFILE_URL);
    });

    const searchBtn = document.getElementById('search-btn');
    const searchName = document.getElementById('search-name');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const userList = document.getElementById('user-list');

    let allUsers = [];

    function fetchUserList() {
        fetch(BASE_URL_API + API_URL + FRIEND_API + 'find', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Users found
                console.log('Users found:', data);
                allUsers = data;
            })
            .catch((error) => {
                console.error('Error during user list retrieval:', error);
                userList.innerHTML = '<li>An error occurred. Please try again later.</li>';
            });
    }

    // Search for users by name
    searchBtn.addEventListener('click', function () {
        const name = searchName.value;
        if (name) {
            const filteredUsers = allUsers.filter((user) => user.name.includes(name));

            // Update the user list with the filtered users
            userList.innerHTML = '';
            if (filteredUsers.length === 0) {
                userList.innerHTML = '<li>No users found.</li>';
            } else {
                filteredUsers.forEach((user) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${user.name}</span>
                        <button class="add-friend" data-name="${user.name}">Add</button>
                    `;
                    userList.appendChild(listItem);
                });
            }
        } else {
            userList.innerHTML = '<li>Please enter a name to search.</li>';
        }
    });

    userList.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-friend')) {
            const friendName = event.target.dataset.name;
            fetch(BASE_URL_API + API_URL + FRIEND_API + 'add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
                body: JSON.stringify({ friend_name: friendName }),
            })
                .then((data) => {
                    console.log('Friend added:', data);
                    userList.innerHTML = '';
                    fetchUserList();
                })
                .catch((error) => {
                    console.error('Error during friend addition:', error);
                    userList.innerHTML = '<li>An error occurred. Please try again later.</li>';
                });
        }
    });
    fetchUserList();
});
