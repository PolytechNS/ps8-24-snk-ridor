document.addEventListener('DOMContentLoaded', function () {
    console.log('arrived in online-game.js');
    const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
    const selfPseudo = currentRoom.joiner;
    const otherPseudo = currentRoom.creator;
    console.log(selfPseudo);
    console.log(otherPseudo);
    document.getElementById('self_pseudo').textContent = selfPseudo;
    document.getElementById('other_pseudo').textContent = otherPseudo;
});

function connectToGame() {
    console.log('connect to game');
    //const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
    //const room = currentRoom.room;
    //console.log(room);
    socket.emit('game:ready', room);
    console.log('emitted game:ready');
}

// setup
socket.on('game:setup', (playerId) => {
    console.log('game:setup ', playerId);
    if (playerId === 1) {
        document.getElementById('self_pseudo').style.color = 'red';
        document.getElementById('other_pseudo').style.color = 'black';
    } else {
        document.getElementById('self_pseudo').style.color = 'black';
        document.getElementById('other_pseudo').style.color = 'red';
    }
});
