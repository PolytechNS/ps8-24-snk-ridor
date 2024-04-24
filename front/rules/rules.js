// onload we retrieve the partial rules page and insert it into the content div

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

    document.getElementById('arrow-right').addEventListener('click', nextRule);
    document.getElementById('arrow-left').addEventListener('click', previousRule);
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
        loadRule(id);
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
