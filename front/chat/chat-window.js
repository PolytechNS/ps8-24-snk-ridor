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

    var badwords = [];
    fetch('/resources/bad-words.txt')
        .then((response) => response.text())
        .then((data) => data.split('\n').forEach((line) => badwords.push(line.trim())));

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
            chat.socket.emit('friend:login', chat.userName);
            fetchMessageHistory(); // Fetch history only after confirming connection
        });

        chat.socket.on('friend:receive', (message) => {
            if (activeFriendName === message.sender) {
                addMessage(message.message, false);
                checkRickRoll(message.message);
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
        let insultes = containsBadWord(message);
        if (message.toLowerCase() === 'rick') {
            let chatMessages = document.getElementById('chatMessages');
            // convert string to HTML
            let messageElement = document.createElement('p');
            messageElement.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            messageElement.target = '_blank';
            let imgElement = document.createElement('img');
            imgElement.src = '/resources/ui/rick.gif';
            imgElement.alt = 'Rick Astley - Never Gonna Give You Up';
            imgElement.style.width = 'auto';
            imgElement.style.height = '100%';
            messageElement.appendChild(imgElement);
            messageElement.className = isSender ? 'sent' : 'received';
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else if (insultes.length > 0) {
            // replace letters with asterisks (except first letter)
            for (let badword of insultes) {
                let badword_replaced = badword[0] + badword.slice(1).replace(/./g, '*');
                message = message.replace(badword, badword_replaced);
            }
            let chatMessages = document.getElementById('chatMessages');
            let messageElement = document.createElement('p');
            messageElement.textContent = message;
            messageElement.className = isSender ? 'sent' : 'received';
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            let chatMessages = document.getElementById('chatMessages');
            let messageElement = document.createElement('p');
            messageElement.textContent = message;
            messageElement.className = isSender ? 'sent' : 'received';
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function checkRickRoll(message) {
        if (message.toLowerCase() === 'rick') {
            let rick_sound = new Audio('/resources/sounds/rick.mp3');
            rick_sound.play();
        }
    }

    // return the list of bad words in the message
    function containsBadWord(message) {
        let bwr = [];
        let message_list = message.toLowerCase().split(' ');
        for (let badword of badwords) {
            if (message_list.includes(badword)) {
                bwr.push(badword);
            }
        }
        return bwr;
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
