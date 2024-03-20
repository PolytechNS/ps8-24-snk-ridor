class BoardEvent {
    player;
    action;
    position;

    constructor(player, action, position) {
        this.player = player;
        this.action = action;
        this.position = position;
    }
}

module.exports = { BoardEvent };
