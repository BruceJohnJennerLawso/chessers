Chessers
========

A game created by a couple of physics students at the University of Waterloo. Half Checkers, half Chess. What else is there to get?

## Development Status
The game currently supports all basic legal movements and chess pieces taking other pieces.

### TODO (in some sort of order):
- ~~basic move checking for chess pieces~~
- ~~basic move checking for checkers pieces (this will be ez)~~
- ~~advanced move checking (i.e. pieces being in between start and end point)~~
- ~~killing~~ DONE FOR SOME PIECES
- kill chain
- socket stuff running for multiplayer
- checkmate
- castling
- pawn promotion
- en passant

## Rules
The game derives its playstyle from both games, as you might have guessed. The rules are (not so) simple. 

On your half of the board, your pieces move as Chess pieces. The same goes for your opponent; on your opponent's half of the board, your opponent's pieces move as Chess pieces. However, on your half of the board, your opponent's pieces move as Checkers pieces, while on your opponent's half of the board, your pieces move as Checkers pieces. Essentially: the way your piece moves changes as it crosses past the center line. When your piece crosses back over to the side, it changes its type once again.

That being said, your piece is allowed to move PAST the center line as a Chess piece (e.g. a queen can move to the very back of the board, permitting that nothing is in her way.) It is not until that move has been made that your piece's move legality is changed. As an additional rule, if your piece moves across the center line to kill, it is then able to make an additional move as a Checkers piece if and only if that additional move is jumping another piece (i.e. killing an opposing piece in Checkers). After making that additional move, the piece may make another move if it too involves jumping an opposing piece (i.e. double-jumping).

The only other rule to the game is actually an alteration to the way the Chess king can move. The king may only move forward or diagonally foward.

Besides those rules, standard Chess and Checkers rules apply. We will be trying to take all of the subtle features in Chess into account, such as castling, pawn promotion, and en passant (who the fuck even uses this?) If you don't know the rules of one of the games, don't come complaining to us about how your piece can't move backwards after becoming a Checkers piece. That's like the main rule of Checkers, dude.

## Contributors

Originally played by Nick Kuzmin and Kelly Ryan as a literal "Chess vs. Checkers" game, where one person played Chess and the other played Checkers on the same board. It became clear very quickly that Chess pieces were far too overpowered and needed to be nerfed. And thus, Chessers was born. After exhaustive testing with Nick, Kelly, Dylan Funk and Dakota St. Laurent (the "Chessers Board of Directors" as it was known), as well as many others, and ridiculous rules added and removed, something half-respectable came out.

## Reviews

"My brain hurts every time I play this fucking game." - Dakota St. Laurent

"No, no, I do not want to play Chessers. It's such an awful game." - Pieter Stam

"Oh, fuck, I know what you're doing, oh god no." - Nick Kuzmin (upon seeing Dakota working on the code)

"It's a fun game, kind of." - Dylan Funk