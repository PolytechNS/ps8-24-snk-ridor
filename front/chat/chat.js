import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

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
        this.activeFriendEmail = null;
        this.socket = io();
        this.initializeSocketListeners();
    }

    initializeSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Socket.IO Connected');
            this.socket.emit('friend:login', this.userEmail);
            this.fetchFriendList();
        });

        this.socket.on('friend:receive', (message) => {
            console.log('Received message:', message);
            if (message.sender === this.activeFriendEmail) {
                this.addMessage(message.message, false);
            } else {
                // Show a notification or update the friend list to indicate a new message
                console.log(`New message from ${message.sender}: ${message.message}`);
            }
        });

        this.socket.on('friend:friends', (friends) => {
            console.log('Received friend list:', friends);
            this.displayFriendList(friends);
        });

        this.socket.on('friend:message_history', (messages) => {
            console.log('Received message history:', messages);
            this.displayMessageHistory(messages);
        });
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
        this.activeFriendEmail = friendName;
        console.log(`Attempting to open chat window for: ${friendName}`);
        let chatWindow = this.shadowRoot.getElementById('chatWindow');
        let chatHeader = this.shadowRoot.getElementById('chatHeader');
        let friendList = this.shadowRoot.getElementById('friendList');

        chatHeader.textContent = friendName;
        chatWindow.style.display = 'block';
        this.chatWindowVisible = true;

        friendList.style.display = 'none';
        this.friendListVisible = false;

        console.log(`Chat window should now be visible for: ${friendName}`);
        this.logElementStyles('chatWindow');

        // Request message history when opening the chat window
        this.socket.emit('friend:history', friendName);
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
        let messageInput = this.shadowRoot.getElementById('messageInput');
        let message = messageInput.value.trim();
        if (message) {
            this.socket.emit('friend:send', {
                receiver: this.activeFriendEmail,
                message: message,
            });
            this.addMessage(message, true);
            messageInput.value = '';
        }
    }

    addMessage(message, isSender) {
        let chatMessages = this.shadowRoot.getElementById('chatMessages');
        let messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.className = isSender ? 'sent' : 'received';
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        console.log(`Message ${isSender ? 'sent' : 'received'}: ${message}`);
    }

    displayFriendList(friends) {
        console.log('Displaying friend list...', friends);
        const friendListElement = this.shadowRoot.getElementById('friendList').querySelector('ul');
        friendListElement.innerHTML = '';

        friends.forEach((friend) => {
            console.log('Adding friend to list:', friend);
            const listItem = document.createElement('li');
            const displayEmail = friend.email;
            listItem.textContent = displayEmail;
            listItem.addEventListener('click', () => {
                console.log(`Friend list item clicked: ${displayEmail}`);
                this.openChatWindow(displayEmail);
            });
            friendListElement.appendChild(listItem);
        });
    }
    displayMessageHistory(messages) {
        let chatMessages = this.shadowRoot.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        messages.forEach((message) => {
            const isSender = message.sender === this.userEmail;
            this.addMessage(message.message, isSender);
        });
    }

    fetchFriendList() {
        console.log('Fetching friend list...');
        this.socket.emit('friend:list');
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
