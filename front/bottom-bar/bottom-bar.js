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
<a href="/online" class="icon-link">
<img src="/resources/svg/chat.svg" alt="Chat" />
<span class="icon-label">Chat</span>
</a>
</div>
`;
    }
}

customElements.define('bottom-bar', BottomBar);
