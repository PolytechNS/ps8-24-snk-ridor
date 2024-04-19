import { BASE_URL_PAGE, LOGIN_URL } from '/util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    });
});
