const chatIcons = document.querySelectorAll('.chat-icon');
const emoteLists = document.querySelectorAll('.emote-list');

chatIcons.forEach((icon) => {
    icon.addEventListener('click', () => {
        const player = icon.dataset.player;
        console.log('Chat icon clicked for player:', player); // Debug log
        const emoteList = document.querySelector(`.emote-list[data-player="${player}"]`);
        if (emoteList) {
            emoteList.style.display = emoteList.style.display === 'grid' ? 'none' : 'grid';
        } else {
            console.log('No emote list found for player:', player);
        }
    });
});

emoteLists.forEach((list) => {
    for (let i = 1; i <= 8; i++) {
        const emoteImg = document.createElement('img');
        emoteImg.src = `/resources/emotes/emote${i}.png`;
        emoteImg.addEventListener('click', () => {
            const player = list.dataset.player;
            // Adjust the class name to match the HTML class
            const profileSelector = player === 'self' ? 'profile_self' : 'profile_adversaire';
            const profileElement = document.querySelector(`.profile.${profileSelector}`);

            if (profileElement) {
                const emoteDisplay = document.querySelector('.emote-display') || document.createElement('div');
                emoteDisplay.classList.add('emote-display');
                emoteDisplay.innerHTML = `<img src="/resources/emotes/emote${i}.png" alt="Emote" />`;
                profileElement.appendChild(emoteDisplay);
                list.style.display = 'none';
                setTimeout(() => {
                    emoteDisplay.remove();
                }, 3000);
            } else {
                console.log('No profile element found for player:', player); // Error log if not found
            }
        });
        list.appendChild(emoteImg);
    }
});
