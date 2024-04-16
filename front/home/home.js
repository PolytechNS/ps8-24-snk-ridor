document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login';
    });
});
