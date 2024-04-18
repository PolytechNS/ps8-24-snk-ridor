import { BASE_URL_PAGE, LOGIN_URL } from './path.js';

window.onload = () => {
    if (!localStorage.getItem('token')) {
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    }
};
