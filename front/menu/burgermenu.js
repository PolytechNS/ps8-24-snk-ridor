// burgermenu.js

const burgerMenuTemplate = document.createElement('template');

burgerMenuTemplate.innerHTML = `
<link rel="stylesheet" href="../menu/burgermenu.css">
<div id="mySidenav" class="sidenav">
  <a id="closeBtn" href="#" class="close">×</a>
  <ul id="menuItems"></ul>
</div>

<a href="#" id="openBtn">
  <span class="burger-icon">
    <span></span>
    <span></span>
    <span></span>
  </span>
</a>
`;

class BurgerMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(burgerMenuTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const sidenav = this.shadowRoot.getElementById('mySidenav');
        const openBtn = this.shadowRoot.getElementById('openBtn');
        const closeBtn = this.shadowRoot.getElementById('closeBtn');
        const menuItems = this.shadowRoot.getElementById('menuItems');

        // Check if the user is logged in
        const token = localStorage.getItem('token');

        if (token) {
            // User is logged in
            menuItems.innerHTML = `
                <li><a href="/profile/profile.html">Profile</a></li>
                <li><a href="/home/home.html">Home</a></li>
                <li><a href="/search/search.html">Search Friends</a></li>
            `;
        } else {
            // User is logged out
            menuItems.innerHTML = `
                <li><a href="/login/login.html">Log In</a></li>
            `;
        }

        openBtn.onclick = () => {
            sidenav.classList.add('active');
        };

        closeBtn.onclick = () => {
            sidenav.classList.remove('active');
        };

        menuItems.querySelectorAll('a').forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const href = item.getAttribute('href');
                window.location.href = href;
            });
        });
    }
}

window.customElements.define('burger-menu', BurgerMenu);
