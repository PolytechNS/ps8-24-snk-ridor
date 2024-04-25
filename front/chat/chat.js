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
        <img src="../resources/svg/chat.svg" alt="Chat Icon" class="chat-icon regular">
        <img src="../resources/svg/chat-notif.svg" alt="Chat Notification Icon" class="chat-icon notif">
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
        this.userName = localStorage.getItem('username');
        this.activeFriendName = null;
        this.socket = io();
        this.unreadMessages = {};
        this.initializeSocketListeners();
    }

    initializeSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Socket.IO Connected');
            this.socket.emit('friend:login', this.userName);
            this.fetchFriendList();
        });

        this.socket.on('friend:receive', (message) => {
            if (this.activeFriendName === message.sender && this.chatWindowVisible) {
                this.addMessage(message.message, false);
            } else {
                if (!this.unreadMessages[message.sender]) {
                    this.unreadMessages[message.sender] = [];
                }
                this.unreadMessages[message.sender].push(message.message);
                this.updateNotificationIcon();
                this.markFriendAsUnread(message.sender);
                this.saveUnreadMessages();
                this.dispatchUnreadMessagesEvent();
            }
            console.log(`New message from ${message.sender}: ${message.message}`);
        });

        this.socket.on('friend:friends', (friends) => {
            this.displayFriendList(friends);
        });

        this.socket.on('friend:message_history', (messages) => {
            this.displayMessageHistory(messages);
        });
    }
    dispatchUnreadMessagesEvent() {
        const event = new CustomEvent('unreadMessagesChanged', {
            detail: this.unreadMessages,
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    logElementStyles(elementId) {
        const elem = this.shadowRoot.getElementById(elementId);
        const style = window.getComputedStyle(elem);
    }

    toggleFriendList() {
        let friendList = this.shadowRoot.getElementById('friendList');
        let chatWindow = this.shadowRoot.getElementById('chatWindow');

        if (this.chatWindowVisible) {
            chatWindow.style.display = 'none';
            this.chatWindowVisible = false;
            this.logElementStyles('chatWindow');
        }

        if (this.friendListVisible) {
            friendList.style.display = 'none';
            this.friendListVisible = false;
        } else {
            friendList.style.display = 'block';
            this.friendListVisible = true;
        }
        this.logElementStyles('friendList');
    }

    openChatWindow(friendName) {
        this.activeFriendName = friendName;
        let chatWindow = this.shadowRoot.getElementById('chatWindow');
        let chatHeader = this.shadowRoot.getElementById('chatHeader');
        let friendList = this.shadowRoot.getElementById('friendList');

        chatHeader.textContent = friendName;
        chatWindow.style.display = 'block';
        this.chatWindowVisible = true;

        friendList.style.display = 'none';
        this.friendListVisible = false;

        if (this.unreadMessages[friendName]) {
            this.unreadMessages[friendName].forEach((message) => {
                this.addMessage(message, false);
            });
            this.unreadMessages[friendName] = [];
            this.markFriendAsRead(friendName);
            this.updateNotificationIcon();
            this.saveUnreadMessages();
        }

        this.logElementStyles('chatWindow');

        this.socket.emit('friend:history', friendName);
    }

    closeChatWindow() {
        let chatWindow = this.shadowRoot.getElementById('chatWindow');
        chatWindow.style.display = 'none';
        this.chatWindowVisible = false;
        this.activeFriendName = null;
        this.logElementStyles('chatWindow');
    }

    handleKeyPress(event) {
        if (event.keyCode === 13) {
            this.sendMessage();
        }
    }

    sendMessage() {
        let messageInput = this.shadowRoot.getElementById('messageInput');
        let message = messageInput.value.trim();
        if (message) {
            this.socket.emit('friend:send', {
                receiver: this.activeFriendName,
                message: message,
            });
            this.addMessage(message, true);
            messageInput.value = '';
        }
    }

    addMessage(message, isSender) {
        if (message.toLowerCase() === 'rick') {
            let chatMessages = this.shadowRoot.getElementById('chatMessages');
            // convert string to HTML
            let messageElement = document.createElement('a');
            messageElement.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            messageElement.target = '_blank';
            let imgElement = document.createElement('img');
            imgElement.src = '/resources/ui/rick.gif';
            messageElement.appendChild(imgElement);
            messageElement.className = isSender ? 'sent' : 'received';
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            let chatMessages = this.shadowRoot.getElementById('chatMessages');
            let messageElement = document.createElement('p');
            messageElement.textContent = message;
            messageElement.className = isSender ? 'sent' : 'received';
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    displayFriendList(friends) {
        const friendListElement = this.shadowRoot.getElementById('friendList').querySelector('ul');
        friendListElement.innerHTML = '';

        friends.forEach((friend) => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-friend', friend.name);
            const displayName = friend.name;
            listItem.textContent = displayName;
            if (this.unreadMessages[friend.name] && this.unreadMessages[friend.name].length > 0) {
                listItem.innerHTML += '<span class="unread-dot"></span>';
            }
            listItem.addEventListener('click', () => {
                this.openChatWindow(displayName);
            });
            friendListElement.appendChild(listItem);
        });
    }

    displayMessageHistory(messages) {
        let chatMessages = this.shadowRoot.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        messages.forEach((message) => {
            const isSender = message.sender === this.userName;
            this.addMessage(message.message, isSender);
        });

        // Rickroll the user if the last message was not sent by the user and the message is 'rick'
        if (messages[messages.length - 1].message.toLowerCase() === 'rick' && messages[messages.length - 1].sender !== this.userName) {
            // get currently played audio
            let audio = document.querySelector('audio');
            if (audio) {
                audio.pause();
            }
            // Rickroll the user with music
            let rick_music = new Audio('/resources/sounds/rick.mp3');
            rick_music.play();
        }
    }

    fetchFriendList() {
        this.socket.emit('friend:list');
    }

    updateNotificationIcon() {
        const hasUnreadMessages = Object.values(this.unreadMessages).some((messages) => messages.length > 0);
        console.log('Has unread messages:', hasUnreadMessages)
        if (hasUnreadMessages) {
            this.showNotificationIcon();
        } else {
            this.hideNotificationIcon();
        }
    }

    showNotificationIcon() {
        console.log('Showing notification icon');
        this.shadowRoot.querySelector('.chat-icon.regular').style.display = 'none';
        this.shadowRoot.querySelector('.chat-icon.notif').style.display = 'inline-block';
    }

    hideNotificationIcon() {
        console.log('Hiding notification icon');
        this.shadowRoot.querySelector('.chat-icon.regular').style.display = 'inline-block';
        this.shadowRoot.querySelector('.chat-icon.notif').style.display = 'none';
    }

    markFriendAsUnread(friendName) {
        const friendElement = this.shadowRoot.querySelector(`#friendList li[data-friend="${friendName}"]`);
        if (friendElement && !friendElement.querySelector('.unread-dot')) {
            friendElement.innerHTML += '<span class="unread-dot"></span>';
        }
    }

    markFriendAsRead(friendName) {
        const friendElement = this.shadowRoot.querySelector(`#friendList li[data-friend="${friendName}"]`);
        if (friendElement) {
            const unreadDot = friendElement.querySelector('.unread-dot');
            if (unreadDot) {
                unreadDot.remove();
            }
        }
    }

    saveUnreadMessages() {
        localStorage.setItem('unreadMessages', JSON.stringify(this.unreadMessages));
    }

    connectedCallback() {
        this.fetchFriendList();
        this.shadowRoot.querySelector('.chat-icon.regular').addEventListener('click', () => this.toggleFriendList());
        this.shadowRoot.querySelector('.chat-icon.notif').addEventListener('click', () => this.toggleFriendList());
        this.shadowRoot.querySelector('.close-button').addEventListener('click', () => this.closeChatWindow());
        this.shadowRoot.querySelector('button').addEventListener('click', () => this.sendMessage());
        this.shadowRoot.getElementById('messageInput').addEventListener('keypress', (event) => this.handleKeyPress(event));
    }
}
export { Chat };
window.customElements.define('chat-global', Chat);
