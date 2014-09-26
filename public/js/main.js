// code.9leap.net default template
// based on enchant.js v0.7.1

enchant();

window.onload = function(){
    var game = new Core(128, 128);
    game.fps = 15;
    game.preload('/public/img/tileset1.png');
    game.preload('/public/img/icon1.png');
    
    // some game logic required
    game.isPieceSelected = false;
    game.activePiece = null;
    game.myTurn = false;
    game.player = 1; // 0 for white, 1 for black, will be null initially - may not be needed

    game.locationsUsed = [];

    game.movePiece = function() {
        // yep.
    }

    game.checkLegalPawn = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        // arguments are self explanatory

        if (pieceID[0] === 'w') {
            // standard movement
            if ((locTile - locPiece) === -8 && !occupied)
                return true;
            // first move can be two spaces forward
            else if ((locTile - locPiece) === -16 && !occupied && !hasMoved)
                return true;
            // attacking
            else if (((locTile - locPiece) === -7 || (locTile - locPiece) === -9) && occupied)
                return true;
        } else {
            if ((locTile - locPiece) === 8 && !occupied)
                return true;
            else if ((locTile - locPiece) === 16 && !occupied && !hasMoved)
                return true;
            else if (((locTile - locPiece) === 7 || (locTile - locPiece) === 9) && occupied)
                return true;
        }

        return false;
    }

    game.isLegalMove = function(piece, tile) {
        // use switch on a piece's type. call appropriate function.
        pieceID = piece.id;
        switch(pieceID[1]) {

            case 'p':
                console.log('hi')
                return game.checkLegalPawn(piece.loc, tile.loc, piece.hasMoved, tile.occupied, pieceID);
                break;

            default:
                return false;
        }
    }

    
    game.addTile = function(i,j,occupied) {
        var tile = new Sprite(16,16);
        tile.image = game.assets['/public/img/tileset1.png'];
        tile.x = 16*i;
        tile.y = 16*j;
        
        // alternate colours of tiles
        if (j%2 === 0)
            tile.frame = (i%2 === 0) ? 0 : 1;
        else
            tile.frame = (i%2 === 0) ? 1 : 0;
        
        tile.occupied = occupied; // initial state of tile
        tile.loc = i + 8*j;       // for checking legality
        
        tile.addEventListener(Event.TOUCH_START, function(e) {

            if (game.isPieceSelected) {
                piece = game.activePiece;

                if (game.isLegalMove(piece, this)) {

                    if (piece.hasMoved) piece.hasMoved = true;
                    var x = Math.floor(e.x/16),
                        y = Math.floor(e.y/16);
                    // move piece
                    piece.x = 16*x;
                    piece.y = 16*y;
                    // update location info
                    game.locationsUsed.pop(game.locationsUsed.indexOf(piece.loc));
                    piece.loc = x + 8*y;
                    game.locationsUsed.push(piece.loc);
                    // no piece should be selected anymore
                    game.isPieceSelected = false;
                }
            }
        });
        
        game.rootScene.addChild(tile);
    }
    
    game.addPiece = function(x,y,frame,id) {
        var piece = new Sprite(16,16);
        piece.image = game.assets['/public/img/icon1.png'];
        piece.frame = frame;
        piece.x = x;
        piece.y = y;
        piece.id = id; // e.g. bp1 (black pawn 1)

        piece.loc = Math.floor(x/16) + 8*Math.floor(y/16);  // grid number
        piece.hasMoved = false; // useful for pawns, king, rooks
        piece.isChessPiece = true;
        piece.isKinged = false;
        game.locationsUsed.push(piece.loc);
        
        piece.addEventListener(Event.TOUCH_START, function() {
            game.isPieceSelected = true;
            game.activePiece = this;
        });
        
        game.rootScene.addChild(piece);
        
    }
    
    game.onload = function () {
        // create the tiles
        for (var j=0; j<2; j++) { // first two rows
            for (var i=0; i<8; i++)
                game.addTile(i,j,true);
        }
        for (var j=2; j<6; j++) { // middle four rows
            for (var i=0; i<8; i++)
                game.addTile(i,j,false);
        }
        for (var j=6; j<8; j++) { // last two rows
            for (var i=0; i<8; i++)
                game.addTile(i,j,true);
        }
        
        game.addPiece(16,16,5,"bp1");
        
    }
    
    
    game.start();
};