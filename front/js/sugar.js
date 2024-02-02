function sendMessage() {
    let input = document.getElementById('chatbox-input-text');
    let message = input.value;
    if (message == '') {
        return;
    }
    console.log('Message: ' + message);
    let messageElement = document.createElement('div');
    messageElement.className = 'message self';
    messageElement.innerHTML = '<div class="message-content"></div>';
    let content = messageElement.getElementsByClassName('message-content')[0];
    content.textContent = message;
    let chatbox = document.getElementById('chatbox-content');
    chatbox.appendChild(messageElement);
    input.value = '';
}

function onChatboxInput(event) {
    if (event.keyCode == 13) { // && !event.shiftKey  pour ne pas envoyer le message si on appuie sur shift+enter
        sendMessage();
    }
}

document.getElementById('chatbox-input-text').addEventListener('keydown', onChatboxInput);
document.getElementById('chatbox-input-send').addEventListener('click', sendMessage);