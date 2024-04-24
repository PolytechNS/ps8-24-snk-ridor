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
        document.getElementById('paysage').style.visibility = 'none';
    } else {
        document.getElementById('portrait').style.visibility = 'none';
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
    console.log(document.querySelectorAll('rule').length);
    console.log(id);
    if (id === 1) {
        console.log('oui');
        if (window.innerHeight > window.innerWidth) {
            document.getElementById('arrow-left-portrait').style.visibility = 'hidden';
        } else {
            document.getElementById('arrow-left').style.visibility = 'hidden';
        }
    } else if (id === document.getElementsByTagName('rule').length) {
        console.log('non');
        if (window.innerHeight > window.innerWidth) {
            document.getElementById('arrow-right-portrait').style.visibility = 'visible';
        } else {
            document.getElementById('arrow-right').style.visibility = 'visible';
        }
        document.getElementById('arrow-left').style.visibility = 'visible';
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
