import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

const chatIcons = document.querySelectorAll('.chat-icon');
const emoteLists = document.querySelectorAll('.emote-list');
const socket = io();

// Join the chat room when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatRoomId = localStorage.getItem('chat_room_id');
    socket.emit('message:join', chatRoomId);
});

chatIcons.forEach((icon) => {
    if (icon.dataset.player === 'other') {
        icon.style.pointerEvents = 'none';
        icon.style.opacity = '0.5';
    } else {
        icon.addEventListener('click', () => {
            const player = icon.dataset.player;
            const emoteList = document.querySelector(`.emote-list[data-player="${player}"]`);
            if (emoteList) {
                emoteList.style.display = emoteList.style.display === 'grid' ? 'none' : 'grid';
            } else {
                console.log('No emote list found for player:', player);
            }
        });
    }
});

emoteLists.forEach((list) => {
    for (let i = 1; i <= 8; i++) {
        const emoteImg = document.createElement('img');
        emoteImg.src = `/resources/emotes/emote${i}.png`;
        emoteImg.addEventListener('click', () => {
            const player = list.dataset.player;
            if (player === 'self') {
                const emoteImageName = `emote${i}.png`;
                socket.emit('message:send', {
                    sender: localStorage.getItem('username'),
                    content: emoteImageName,
                });
                displayEmote(player, emoteImageName);
                list.style.display = 'none';
            } else {
                console.log('Opponent emote clicked, ignoring');
            }
        });
        list.appendChild(emoteImg);
    }
});

function displayEmote(player, emoteImageName) {
    const profileSelector = player === 'self' ? 'profile_self' : 'profile_adversaire';
    const profileElement = document.querySelector(`.profile.${profileSelector}`);

    if (profileElement) {
        const emoteDisplay = document.querySelector('.emote-display') || document.createElement('div');
        emoteDisplay.classList.add('emote-display');
        emoteDisplay.innerHTML = `<img src="/resources/emotes/${emoteImageName}" alt="Emote" />`;
        profileElement.appendChild(emoteDisplay);
        setTimeout(() => {
            emoteDisplay.remove();
            console.log('Removing emote for player:', player);
        }, 5000);
    } else {
        console.log('No profile element found for player:', player);
    }
}

socket.on('message:receive', (data) => {
    console.log('Received message:', data);
    const sender = data.sender;
    const emoteImageName = data.content;
    const player = sender === localStorage.getItem('username') ? 'self' : 'other';
    console.log('Displaying received emote for player:', player);
    displayEmote(player, emoteImageName);
});