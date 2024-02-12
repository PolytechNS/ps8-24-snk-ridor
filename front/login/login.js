document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.form-container .login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector(
            'input[type="password"]'
        ).value;

        const loginData = { email, password };

        fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
            .then((response) => {
                if (!response.ok) {
                    console.log(`Login failed with status: ${response.status}`);
                    throw new Error('Login failed. Please try again later.');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Login successful with data:', data);
                window.location.href = '/ps8-24-snk-ridor/index/';
            })
            .catch((error) => {
                console.error('Error during login:', error);
                alert(error.message);
            });
    });

    const signupButton = document.getElementById('signup-login');
    signupButton.addEventListener('click', function () {
        window.location.href = '/ps8-24-snk-ridor/front/signup/'; // Ensure this path is correct
    });
});
