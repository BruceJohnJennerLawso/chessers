// code.9leap.net default template
// based on enchant.js v0.7.1

enchant();

window.onload = function(){
    var game = new Core(128, 128);
    game.fps = 5;
    game.preload('/public/img/tileset1.png');
    game.preload('/public/img/icon1.png');
    
    // some game logic required
    game.isPieceSelected = false;
    game.activePiece = null;
    game.myTurn = false;
    game.player = 1; // 0 for white, 1 for black, will be null initially - may not be needed

    game.locationsUsed = [];



    // ****** CHECKING FOR LEGALITY STARTS HERE ******

    game.searchBetweenTiles = function(start, end, step) {
        // searches between (exclusive) tiles - only allows for linear searches
        // i.e. rook, queen, and bishop movements (horizontal/vertical/diagonal)
        for (var i=start+step; i<end; i+=step) {
            if (game.locationsUsed.indexOf(i) !== -1)
                return false;
        }
        return true;
    }

    game.searchBetweenTilesNEIGH = function(arr) {
        // lol function name
        // given array of grid numbers, searches if those are being used
        // used for knights (horses) because fuck those guys seriously
        for (var i = 0; i < arr.length; i++) {
            if (games.locationsUsed.indexOf(arr[i]) !== -1)
                return false;
        }
        return true;
    }

    game.moveHorizontal = function(locPiece, locTile) {
        // checks to see if a piece can move horizontally legally
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece;

        if (Math.abs(locTile - locPiece) < 8) {
            var leftEndTile = 8*Math.floor(locTile/8),
                rightEndTile = leftEndTile + 7;

            if (!(locPiece >= leftEndTile && locPiece <= rightEndTile))
                return false;

            return game.searchBetweenTiles(i,N,1);
        }

        return false;
    }

    game.moveVertical = function(locPiece, locTile) {
        // checks to see if a piece can move vertically legally
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece;

        if (Math.abs(locTile - locPiece)%8 === 0)
            return game.searchBetweenTiles(i,N,8);

        return false;
    }

    game.moveDiagonal = function(locPiece, locTile) {
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece;

        if (Math.abs(locTile - locPiece)%7 === 0)
            return game.searchBetweenTiles(i,N,7);
        else if (Math.abs(locTile - locPiece)%9 === 0)
            return game.searchBetweenTiles(i,N,9);

        return false;
    }


    game.checkLegalPawn = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        /*
        This checks for the colour of the piece first, as that matters for pawns. Then, it 
        checks for standard movement (1 forward), abnormal movement (2 forward on first move) 
        and then for killing.
        */

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

    game.checkLegalKing = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        // hasMoved will be required for castling.
        if (pieceID[0] === 'w') {
            // standard movement
            if ((locTile - locPiece) === -7 || (locTile - locPiece) === -8 || 
                (locTile - locPiece) === -9)
                return true;
        } else {
            if ((locTile - locPiece) === 7 || (locTile - locPiece) === 8 || 
                (locTile - locPiece) === 9)
                return true;
        }

        return false;
    }

    /*
    All other pieces follow the same format: check for correct movement, then check to see if 
    anything was actually blocking its movement (check for tile occupation in between starting 
    point and ending point).
    */
    game.checkLegalHorse = function(locPiece, locTile) {
        if (Math.abs(locTile - locPiece) === 6 || Math.abs(locTile - locPiece) === 10 ||
            Math.abs(locTile - locPiece) === 15 || Math.abs(locTile - locPiece) === 17)
            return true;

        return false;
    }

    game.checkLegalRook = function(locPiece, locTile) {
        return (game.moveHorizontal(locPiece, locTile) || game.moveVertical(locPiece, locTile));
    }

    game.checkLegalBishop = function(locPiece, locTile) {
        return game.moveDiagonal(locPiece, locTile);
    }

    game.checkLegalQueen = function(locPiece, locTile) {
        return (game.moveVertical(locPiece, locTile) || game.moveHorizontal(locPiece, locTile) || 
            game.moveDiagonal(locPiece, locTile));
    }

    game.isLegalMove = function(piece, tile) {
        // use switch on a piece's type. call appropriate function.
        pieceID = piece.id;
        switch(pieceID[1]) {

            case 'p': // pawn
                return game.checkLegalPawn(piece.loc, tile.loc, piece.hasMoved, tile.occupied, pieceID);
                break;

            case 'r': // rook
                return game.checkLegalRook(piece.loc, tile.loc);
                break;

            case 'b': // bishop
                return game.checkLegalBishop(piece.loc, tile.loc);
                break;

            case 'q':
                return game.checkLegalQueen(piece.loc, tile.loc);
                break;

            case 'h':
                return game.checkLegalHorse(piece.loc, tile.loc);
                break;

            case 'k':
                return game.checkLegalKing(piece.loc, tile.loc, piece.hasMoved, tile.occupied, pieceID);
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
        tile.loc = i + 8*j;       // grid number
        tile.piece = null;        // piece occupying tile
        
        tile.addEventListener(Event.TOUCH_START, function(e) {

            if (game.isPieceSelected) {
                piece = game.activePiece;

                if (game.isLegalMove(piece, this)) {

                    if (!piece.hasMoved) piece.hasMoved = true;
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
        
        game.addPiece(64,0,0,"bk1");
        game.addPiece(16,16,5,"bp1");
        game.addPiece(0,0,6,"br1");
        game.addPiece(32,0,7,"bb1");
        game.addPiece(48,0,1,"bq1");
        game.addPiece(16,0,2,"bh1");
    }
    
    game.start();
}