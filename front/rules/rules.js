import { BASE_URL_PAGE, HOME_URL } from '../util/path.js';

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
        window.location.replace(BASE_URL_PAGE + HOME_URL);
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
        id = 1;
    }
    try {
        let rule = rules.getElementById(id).innerHTML;
        document.getElementById('rules').innerHTML = rule;
    } catch (error) {
        id--;
    }
    if (id === 1) {
        document.getElementById('arrow-left').style.display = 'invisible';
        document.getElementById('arrow-left-portrait').style.display = 'invisible';
    } else if (id === document.getElementsByClassName('rule').length) {
        document.getElementById('arrow-right').style.display = 'visible';
        document.getElementById('arrow-left-portrait').style.display = 'visible';
        document.getElementById('arrow-left').style.display = 'visible';
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
