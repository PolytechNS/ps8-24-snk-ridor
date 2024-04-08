# Documentation

## Game Rules

Fog of war :

-   The game can only be played with 2 players, 1 versus 1.
-   The game is played on a 9x9 board.
-   At the beginning of the game, each cell on the 4 first lines have a visibility of +1, the ones on the fifth line have a visibility of 0, and the 4 last lines have a visibility of -1.

Players :

-   Player A starts on any column of line 1 ; Player B starts on any column of line 9.
-   During the game, the cell the player A is on, and the 4 adjacent cells, have a +1 visibility ; the cell the player B is on, and the 4 adjacent cells, have a -1 visibility.

Walls :

-   Walls are 2 cells long and can be placed between cells ; each players starts with 10 Walls.
-   Each cell in contact with a Wall placed by player A gets +2 visibility; Each cell that is 1 cell away from a Wall placed by player A gets +1 visibility.
-   Each cell in contact with a Wall placed by player B gets -2 visibility; Each cell that is 1 cell away from a Wall placed by player B gets —1 visibility.
-   The visibility modifiers are cumulative.

Visibility :

-   Player A can only see cell it's on, and the cells that have a visibility score of at least 0 ; Player B can only see cell it's on, and the cells that have a visibility score of at most 0.
-   A player can see the other player if it is 1 cell away or if it is on a visibility cell.
-   PLayers don't know the visibility value of a cell ; they just know if they can see it.
-   Players can't see the walls.

Goal :

-   The goal for Player A is to reach the line 9 ; Player B have to reach line 1.
-   Player A plays first.
-   If Player A reaches line 9 first, Player B has one move to try and reach line 1. If player B succeeds, the game ends in a draw ; otherwise, Player A wins.
-   If Player B reaches line 1 first, the game ends with Player B victory.
-   When it's a player turn, the options are :
    -   Placing a wall somewhere it doesn't make it impossible for any player to reach the end,
    -   Moving 1 cell in a caridnal direction. Notes :
        -   Players can't jump over walls
        -   Players can jump over other players
    -   Players cannot skip their turn unless they have no action available.
-   After 100 turns from both players (200 in total), the game ends in a draw.
