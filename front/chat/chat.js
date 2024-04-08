const chatTemplate = document.createElement('template');

chatTemplate.innerHTML = `
<link rel="stylesheet" href="../chat/chat.css">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chat</title>
</head>
<body>
    <div class="chat-container">
        <img src="../resources/ui/chat.png" alt="Chat Icon" class="chat-icon">
        <div class="friend-list" id="friendList">
            <ul></ul>
        </div>
    </div>
    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            <span id="chatHeader"></span>
            <img src="../resources/ui/x.png" alt="Close" class="close-button">
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type your message...">
            <button>Send</button>
        </div>
    </div>
</body>
</html>
`;

class Chat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
        this.friendListVisible = false;
        this.chatWindowVisible = false;
        this.userEmail = localStorage.getItem('email');
        this.authToken = localStorage.getItem('token');
    }

    logElementStyles(elementId) {
        const elem = this.shadowRoot.getElementById(elementId);
        const style = window.getComputedStyle(elem);
        console.log(`Styles for ${elementId}: display = ${style.display}, visibility = ${style.visibility}`);
    }

    toggleFriendList() {
        console.log('Toggling friend list...');
        let friendList = this.shadowRoot.getElementById('friendList');
        let chatWindow = this.shadowRoot.getElementById('chatWindow');

        if (this.chatWindowVisible) {
            console.log('Chat window is visible, hiding now...');
            chatWindow.style.display = 'none';
            this.chatWindowVisible = false;
            this.logElementStyles('chatWindow');
        }

        if (this.friendListVisible) {
            console.log('Friend list is visible, hiding now...');
            friendList.style.display = 'none';
            this.friendListVisible = false;
        } else {
            console.log('Friend list is hidden, showing now...');
            friendList.style.display = 'block';
            this.friendListVisible = true;
        }
        this.logElementStyles('friendList');
    }

    openChatWindow(friendName) {
        console.log(`Attempting to open chat window for: ${friendName}`);
        let chatWindow = this.shadowRoot.getElementById('chatWindow');
        let chatHeader = this.shadowRoot.getElementById('chatHeader');
        let friendList = this.shadowRoot.getElementById('friendList');

        chatHeader.textContent = friendName;
        chatWindow.style.display = 'block';
        this.chatWindowVisible = true;

        friendList.style.display = 'none'; // Directly hide the friend list without toggling
        this.friendListVisible = false; // Ensure the state reflects this change

        console.log(`Chat window should now be visible for: ${friendName}`);
        this.logElementStyles('chatWindow');
    }

    closeChatWindow() {
        console.log('Closing chat window...');
        let chatWindow = this.shadowRoot.getElementById('chatWindow');
        chatWindow.style.display = 'none';
        this.chatWindowVisible = false;
        this.logElementStyles('chatWindow');
    }

    handleKeyPress(event) {
        if (event.keyCode === 13) {
            console.log('Enter key pressed, sending message...');
            this.sendMessage();
        }
    }

    sendMessage() {
        console.log('Sending message...');
        let messageInput = this.shadowRoot.getElementById('messageInput');
        let message = messageInput.value.trim();

        if (message !== '') {
            let chatMessages = this.shadowRoot.getElementById('chatMessages');
            let messageElement = document.createElement('p');
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            messageInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.log('Message sent and appended to chat.');
        } else {
            console.log('No message to send (input was empty).');
        }
    }

    displayFriendList(data) {
        console.log('Displaying friend list...', data);
        const friendListElement = this.shadowRoot.getElementById('friendList').querySelector('ul');
        friendListElement.innerHTML = '';

        data.forEach((friend) => {
            console.log('Adding friend to list:', friend);
            const listItem = document.createElement('li');
            const displayEmail = friend.user_email === this.userEmail ? friend.friend_email : friend.user_email;
            listItem.textContent = displayEmail;
            listItem.addEventListener('click', () => {
                console.log(`Friend list item clicked: ${displayEmail}`);
                this.openChatWindow(displayEmail);
            });
            friendListElement.appendChild(listItem);
        });
    }

    fetchFriendList() {
        console.log('Fetching friend list...');
        fetch('http://localhost:8000/api/friend/list', {
            headers: {
                Authorization: this.authToken,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Friend list data fetched:', data);
                this.displayFriendList(data);
            })
            .catch((error) => console.error('Error fetching friend list:', error));
    }

    connectedCallback() {
        console.log('Chat component added to the DOM, initializing...');
        this.fetchFriendList();
        this.shadowRoot.querySelector('.chat-icon').addEventListener('click', () => this.toggleFriendList());
        this.shadowRoot.querySelector('.close-button').addEventListener('click', () => this.closeChatWindow());
        this.shadowRoot.querySelector('button').addEventListener('click', () => this.sendMessage());
        this.shadowRoot.getElementById('messageInput').addEventListener('keypress', (event) => this.handleKeyPress(event));
    }
}

window.customElements.define('chat-global', Chat);
