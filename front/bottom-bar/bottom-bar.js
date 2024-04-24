class BottomBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
<link rel="stylesheet" href="/bottom-bar/bottom-bar.css" />
<div class="bottom-bar">
<a href="/home" class="icon-link">
<img src="/resources/svg/home.svg" alt="Home" />
<span class="icon-label">Home</span>
</a>
<a href="/profile" class="icon-link">
<img src="/resources/svg/profile.svg" alt="Profile" />
<span class="icon-label">Profile</span>
</a>
<a href="/chat/friend-list" class="icon-link">
<img src="/resources/svg/chat.svg" alt="Chat" class="chat-icon" />
<span class="icon-label">Chat</span>
</a>
</div>
`;
    }

    connectedCallback() {
        console.log('BottomBar connected to the DOM');
        this.updateChatIcon();
        document.addEventListener('unreadMessagesChanged', this.updateChatIcon.bind(this));
    }

    disconnectedCallback() {
        console.log('BottomBar disconnected from the DOM');
        document.removeEventListener('unreadMessagesChanged', this.updateChatIcon.bind(this));
    }

    updateChatIcon(event) {
        const unreadMessages = event ? event.detail : JSON.parse(localStorage.getItem('unreadMessages')) || {};
        const hasUnreadMessages = Object.values(unreadMessages).some((messages) => messages.length > 0);
        const chatIcon = this.shadowRoot.querySelector('.chat-icon');

        console.log('updateChatIcon called');
        console.log('unreadMessages:', unreadMessages);
        console.log('hasUnreadMessages:', hasUnreadMessages);

        if (chatIcon) {
            const iconSrc = hasUnreadMessages ? '/resources/svg/chat-notif.svg' : '/resources/svg/chat.svg';
            console.log('Setting chat icon src to:', iconSrc);
            chatIcon.src = iconSrc;
        } else {
            console.warn('Chat icon element not found');
        }
    }
}

customElements.define('bottom-bar', BottomBar);
