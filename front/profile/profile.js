document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    console.log(username, email);

    if (!token || !username || !email) {
        // Token or user information not found, redirect to login page
        window.location.href = '/login/login.html';
        return;
    }

    // Update profile information on the page
    document.getElementById('profile-name').textContent = username;
    document.getElementById('profile-email').textContent = email;
    /*
    // Make API request to fetch user's friend list
    fetch('http://localhost:8000/api/friend/list', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                // Friend list retrieved successfully
                console.log('Friend list:', body);
                // Update friends list on the page
                const friendsList = document.getElementById('friends-list');
                body.forEach((friend) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = friend.email; // Assuming the friend object has an 'email' property
                    friendsList.appendChild(listItem);
                });
            } else {
                // Friend list retrieval failed
                console.log(`Friend list retrieval failed with status: ${status}`, body);
                // Display an error message to the user
                alert('Failed to retrieve friend list. Please try again later.');
            }
        })
        .catch((error) => {
            console.error('Error during friend list retrieval:', error);
            alert('An error occurred while retrieving friend list. Please try again later.');
        });
     */
});
