import { BASE_URL_API, BASE_URL_PAGE, API_URL, AUTH_API, LOGIN_URL, REGISTER_API } from '/util/path.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.replace(BASE_URL_PAGE + LOGIN_URL);
    });
    const signupForm = document.querySelector('.form-container .login-form');

    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            console.log('Passwords do not match.'); // Log for mismatched passwords
            alert('Passwords do not match.');
            return;
        }

        const userData = { email, username, password };

        fetch(BASE_URL_API + API_URL + AUTH_API + REGISTER_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then((response) => {
                if (!response.ok) {
                    console.log(`Signup failed with status: ${response.status}`);
                    throw new Error('Signup failed. Please try again later.');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Signup successful with data:', data);
                window.location.replace(BASE_URL_PAGE + LOGIN_URL);
            })
            .catch((error) => {
                console.error('Error during signup:', error);
                alert(error.message);
            });
    });
});
