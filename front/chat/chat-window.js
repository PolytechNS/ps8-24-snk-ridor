import { Chat } from '/chat/chat.js';
import { BASE_URL_PAGE, FRIEND_LIST_URL, CHAT_URL } from '/util/path.js';

document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat();
    const chatHeader = document.getElementById('chatHeader');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const backButton = document.querySelector('.back-button');
    const activeFriendName = localStorage.getItem('activeFriendName');

    chatHeader.textContent = activeFriendName;

    // Initialize socket connections and event listeners
    initializeSocketListeners();

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    backButton.addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + CHAT_URL + '/' + FRIEND_LIST_URL);
    });

    function initializeSocketListeners() {
        chat.socket.on('connect', () => {
            console.log('Socket.IO Connected');
            chat.socket.emit('friend:login', chat.userName);
            fetchMessageHistory(); // Fetch history only after confirming connection
        });

        chat.socket.on('friend:receive', (message) => {
            console.log('Received message:', message);
            if (activeFriendName === message.sender) {
                addMessage(message.message, false);
            }
        });

        // This should only be set up once
        chat.socket.on('friend:message_history', (messages) => {
            displayMessageHistory(messages);
        });
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            chat.socket.emit('friend:send', {
                receiver: activeFriendName,
                message: message,
            });
            addMessage(message, true);
            messageInput.value = '';
        }
    }

    function addMessage(message, isSender) {
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.className = isSender ? 'sent' : 'received';
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function fetchMessageHistory() {
        chat.socket.emit('friend:history', activeFriendName);
    }

    function displayMessageHistory(messages) {
        chatMessages.innerHTML = '';
        messages.forEach((message) => {
            const isSender = message.sender === chat.userName;
            addMessage(message.message, isSender);
        });
    }
});
