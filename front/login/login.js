document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('token')) {
        window.location.href = 'home';
    }
    const loginForm = document.querySelector('.form-container .login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        const loginData = { email, password };

        fetch('http://localhost:8000/api/auth/login', {
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
                    window.location.href = '/home/home.html';
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
        window.location.href = 'signup';
    });
});
