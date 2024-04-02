document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    console.log(username, email);

    if (!token || !username || !email) {
        window.location.href = '/login/login.html';
        return;
    }
    console.log(token);

    // Update profile information on the page
    document.getElementById('profile-name').textContent = username;
    document.getElementById('profile-email').textContent = email;

    fetch('http://localhost:8000/api/friend/list', {
        headers: {
            Authorization: `${token}`,
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Friend list retrieval failed with status: ${response.status}`);
            }
        })
        .then((data) => {
            console.log('Friend list:', data);
            const friendsList = document.getElementById('friends-list');
            data.forEach((friend) => {
                const listItem = document.createElement('li');
                listItem.textContent = friend.friend_email;
                friendsList.appendChild(listItem);
            });
        })
        .catch((error) => {
            console.error('Error during friend list retrieval:', error);
        });
    const addFriendBtn = document.getElementById('add-friend-btn');
    addFriendBtn.addEventListener('click', function () {
        window.location.href = '/friend/friend.html';
    });
});
