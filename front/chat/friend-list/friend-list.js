import { Chat } from '/chat/chat.js';
import { BASE_URL_PAGE, CHAT_URL } from '/util/path.js';

document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat();

    const friendListElement = document.getElementById('friendList').querySelector('ul');

    // Show loading state
    friendListElement.innerHTML = '<li>Loading friends...</li>';

    chat.socket.on('connect', () => {
        console.log('Socket.IO Connected');
        chat.socket.emit('friend:login', chat.userName);
        chat.fetchFriendList();
    });

    chat.socket.on('friend:friends', (friends) => {
        // Clear the loading state
        friendListElement.innerHTML = '';

        // Retrieve the unreadMessages object from localStorage
        const unreadMessages = JSON.parse(localStorage.getItem('unreadMessages')) || {};

        // Populate the friend list
        friends.forEach((friend) => {
            console.log(friend.name);
            const listItem = document.createElement('li');
            listItem.setAttribute('data-friend', friend.name);
            listItem.textContent = friend.name;

            // Check for unread messages and add the unread dot if necessary
            if (unreadMessages[friend.name] && unreadMessages[friend.name].length > 0) {
                listItem.innerHTML += '<span class="unread-dot"></span>';
            }

            // Add click event listener to open the chat window and remove the red dot
            listItem.addEventListener('click', () => {
                localStorage.setItem('activeFriendName', friend.name);

                // Remove the unread messages for the clicked friend
                if (unreadMessages[friend.name]) {
                    delete unreadMessages[friend.name];
                    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
                }

                // Remove the red dot from the clicked friend element
                const unreadDot = listItem.querySelector('.unread-dot');
                if (unreadDot) {
                    unreadDot.remove();
                }

                window.location.replace(BASE_URL_PAGE + CHAT_URL);
            });

            friendListElement.appendChild(listItem);
        });
    });

    // Listen for the 'unreadMessagesChanged' event
    document.addEventListener('unreadMessagesChanged', (event) => {
        const unreadMessages = event.detail;
        const friendElements = friendListElement.querySelectorAll('li');

        friendElements.forEach((friendElement) => {
            const friendName = friendElement.getAttribute('data-friend');

            if (unreadMessages[friendName] && unreadMessages[friendName].length > 0) {
                // Add the unread dot if the friend has unread messages
                if (!friendElement.querySelector('.unread-dot')) {
                    friendElement.innerHTML += '<span class="unread-dot"></span>';
                }
            } else {
                // Remove the unread dot if the friend has no unread messages
                const unreadDot = friendElement.querySelector('.unread-dot');
                if (unreadDot) {
                    unreadDot.remove();
                }
            }
        });
    });
});
