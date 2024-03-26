document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.form-container .login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        const loginData = { email, password };

        fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
            .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status !== 200) {
                    console.log(`Login failed with status: ${status}`, body);
                    throw new Error('Invalid login credentials. Please try again.');
                }
                console.log('Login successful with data:', body);
                window.location.href = '/';
            })
            .catch((error) => {
                console.error('Error during login:', error);
                alert(error.message);
            });
    });

    const signupButton = document.getElementById('signup-login');
    signupButton.addEventListener('click', function () {
        window.location.href = '/signup/signup.html';
    });
});
