import { BASE_URL_API, BASE_URL_PAGE, API_URL, HOME_URL, AUTH_API, LOGIN_API, SIGNUP_URL } from 'util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.form-container .login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        const loginData = { email, password };

        fetch(BASE_URL_API + API_URL + AUTH_API + LOGIN_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
            .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    // Login successful
                    console.log('Login successful:', body);
                    // Perform actions with the response data
                    localStorage.setItem('token', body.token);
                    localStorage.setItem('username', body.username);
                    localStorage.setItem('email', body.email);
                    window.location.replace(BASE_URL_PAGE + HOME_URL);
                } else {
                    // Login failed
                    console.log(`Login failed with status: ${status}`, body);
                    // Display an error message to the user
                    alert('Invalid login credentials. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            });
    });

    const signupButton = document.getElementById('signup-login');
    signupButton.addEventListener('click', function () {
        window.location.replace(BASE_URL_PAGE + SIGNUP_URL);
    });
});
