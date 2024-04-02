document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const searchEmail = document.getElementById('search-email');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const userList = document.getElementById('user-list');

    let allUsers = [];

    function fetchUserList() {
        fetch('http://localhost:8000/api/friend/find', {
            headers: {
                Authorization: `${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Users found
                console.log('Users found:', data);
                allUsers = data;
                allUsers.forEach((user) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${user.name} (${user.email})</span>
                        <button class="add-friend" data-email="${user.email}">Add</button>
                    `;
                    userList.appendChild(listItem);
                });
            })
            .catch((error) => {
                console.error('Error during user list retrieval:', error);
                userList.innerHTML = '<li>An error occurred. Please try again later.</li>';
            });
    }

    // Search for users by email
    searchBtn.addEventListener('click', function () {
        const email = searchEmail.value;
        if (email) {
            const filteredUsers = allUsers.filter((user) => user.email.includes(email));

            // Update the user list with the filtered users
            userList.innerHTML = '';
            if (filteredUsers.length === 0) {
                userList.innerHTML = '<li>No users found.</li>';
            } else {
                filteredUsers.forEach((user) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${user.name} (${user.email})</span>
                        <button class="add-friend" data-email="${user.email}">Add</button>
                    `;
                    userList.appendChild(listItem);
                });
            }
        } else {
            userList.innerHTML = '<li>Please enter an email to search.</li>';
        }
    });

    userList.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-friend')) {
            const email = event.target.dataset.email;
            fetch('http://localhost:8000/api/friend/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
                body: JSON.stringify({ friend_email: email }),
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

    // Fetch the user list when the page loads
    fetchUserList();
});
