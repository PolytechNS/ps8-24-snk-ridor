import { BASE_URL_PAGE, HOME_URL, ONLINE_URL } from '../util/path.js';

var rules;
var id = 1;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/partial-rules')
        .then((response) => response.text())
        .then((data) => {
            // store rules as html content in a variable
            rules = new DOMParser().parseFromString(data, 'text/html');
            loadRule(id);
        });

    document.getElementById('back-button').addEventListener('click', () => {
        let back = localStorage.getItem('returnPage');
        if (back === 'online') {
            localStorage.removeItem('returnPage');
            window.location.replace(BASE_URL_PAGE + ONLINE_URL);
        } else {
            window.location.replace(BASE_URL_PAGE + HOME_URL);
        }
    });

    document.getElementById('arrow-right').addEventListener('click', nextRule);
    document.getElementById('arrow-left').addEventListener('click', previousRule);
    document.getElementById('arrow-left-portrait').addEventListener('click', previousRule);

    // add event listeners for the arrow keys
    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
            nextRule();
        } else if (event.key === 'ArrowLeft') {
            previousRule();
        }
    });

    // if orientation portrait, hide arrows
    if (window.innerHeight > window.innerWidth) {
        document.getElementById('paysage').style.display = 'none';
    } else {
        document.getElementById('portrait').style.display = 'none';
    }
});

function loadRule() {
    if (id < 1) {
        id++;
    }
    try {
        let rule = rules.getElementById(id).innerHTML;
        document.getElementById('rules').innerHTML = rule;
    } catch (error) {
        id--;
    }
    // if it is the first rule, hide the left arrow
    if (id === 1) {
        if (window.innerHeight > window.innerWidth) {
            // si on est en mode portrait, on cache la fleche de gauche portrait
            document.getElementById('arrow-left-portrait').style.visibility = 'hidden';
            document.getElementById('arrow-left-portrait').style.cursor = 'default';
        } else {
            // sinon on cache la fleche de gauche
            document.getElementById('arrow-left').style.visibility = 'hidden';
            document.getElementById('arrow-left').style.cursor = 'default';
        }
        // if it is the last rule, hide the right arrow
    } else if (id === rules.querySelectorAll('rule').length) {
        document.getElementById('arrow-right').style.visibility = 'hidden';
        document.getElementById('arrow-right').style.cursor = 'default';
    } else {
        document.getElementById('arrow-right').style.visibility = 'visible';
        document.getElementById('arrow-right').style.cursor = 'pointer';
        if (window.innerHeight > window.innerWidth) {
            document.getElementById('arrow-left-portrait').style.visibility = 'visible';
            document.getElementById('arrow-left-portrait').style.cursor = 'pointer';
        } else {
            document.getElementById('arrow-left').style.visibility = 'visible';
            document.getElementById('arrow-left').style.cursor = 'pointer';
        }
    }
}

function nextRule() {
    id += 1;
    loadRule(id);
}

function previousRule() {
    id -= 1;
    loadRule(id);
}
