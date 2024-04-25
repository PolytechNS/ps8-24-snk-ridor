import { API_URL, BASE_URL_API } from './path.js';
document.addEventListener('DOMContentLoaded', function() {
    fetchMe();
});

function fetchMe() {
    let token = localStorage.getItem('token');
    fetch(BASE_URL_API + API_URL + 'leaderboard/me', {
        headers: {
            Authorization: `${token}`,
        },
    })
        .then(handleResponse)
        .then((data) => {
            localStorage.setItem('elo', data.elo);
        })
        .catch((error) => {
            console.error('Error during me retrieval:', error);
        });
}
function handleResponse(response) {
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Friend list retrieval failed with status: ${response.status}`);
    }
}