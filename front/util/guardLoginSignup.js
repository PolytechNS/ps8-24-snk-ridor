import { BASE_URL_PAGE, HOME_URL, LOGIN_URL } from './path.js';

window.onload = () => {
    if (localStorage.getItem('token')) {
        window.location.replace(BASE_URL_PAGE + HOME_URL);
    }
};
