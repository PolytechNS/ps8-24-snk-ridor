import { API_URL, HOME_URL, LOGIN_API, SIGNUP_URL } from '../util/path.js';
import { BASE_URL_API, BASE_URL_PAGE } from '../util/frontPath.js';

document.getElementById('signup-login').addEventListener('click', function () {
    window.location.replace(BASE_URL_PAGE + SIGNUP_URL);
});

document
    .getElementById('login-form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        const values = {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value,
        };

        fetch(BASE_URL_API + API_URL + LOGIN_API, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        }).then(async (response) => {
            if (!response.ok) {
                alert(
                    "La combinaison nom d'utilisateur/mot de passe est incorrecte."
                );
                return;
            }
            let jwtToken = await response.text();
            localStorage.setItem('token', jwtToken);

            let parsedJwt = parseJwt(jwtToken);

            let username = parsedJwt.username;
            localStorage.setItem('username', username);

            let userId = parsedJwt.userId;
            localStorage.setItem('userId', userId);
            window.location.replace(BASE_URL_PAGE + HOME_URL);
        });
    });

function parseJwt(token) {
    if (token === null || token.indexOf('.') === -1) return null;
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function isTokenValid(token) {
    let parsedJwt = parseJwt(token);
    if (parsedJwt === null) return false;
    let expirationTime = parsedJwt.exp;
    let currentTime = Date.now() / 1000;
    return currentTime < expirationTime;
}
