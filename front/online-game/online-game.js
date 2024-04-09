document.addEventListener('DOMContentLoaded', function () {
    const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
    const selfPseudo = currentRoom.joiner;
    const otherPseudo = currentRoom.creator;
    console.log(selfPseudo);
    console.log(otherPseudo);
    document.getElementById('self_pseudo').textContent = selfPseudo;
    document.getElementById('other_pseudo').textContent = otherPseudo;
});
