// code.9leap.net default template
// based on enchant.js v0.7.1

enchant();

window.onload = function(){
    var game = new Core(128, 128);
    game.fps = 5;
    game.preload('/public/img/tileset1.png');
    game.preload('/public/img/icon1.png'); // white pieces
    game.preload('/public/img/icon2.png'); // black pieces
    
    game.isPieceSelected = false;
    game.activePiece = null;
    game.myTurn = false;
    game.player = null;

    var frames = [6,2,7,1,0,7,2,6],
        IDs = ['r','h','b','q','k','b','h','r'];

    game.tiles = {}; // {gridNumber: tileObject}
    game.pieces = {}; // {gridNumber: pieceObject}; this isn't really used but is needed once.

    game.movePiece = function(piece, tile, e) {
        /* moves a piece from its current location to tile's location */

        if (!piece.hasMoved)
            piece.hasMoved = true;

        if (piece.id[0] === 'w') {
            // check for crossing the midpoint
            if (piece.isChessPiece && tile.loc < 32)
                piece.isChessPiece = false; 
            else if (!piece.isChessPiece && tile.loc >= 32)
                piece.isChessPiece = true;

            // check for reaching the end
            if (tile.loc < 8 && !piece.isKinged)
                piece.isKinged = true;
        } else {
            if (piece.isChessPiece && tile.loc >= 32)
                piece.isChessPiece = false;
            else if (!piece.isChessPiece && tile.loc < 32)
                piece.isChessPiece = true;

            if (tile.loc >= 56 && !piece.isKinged)
                piece.isKinged = true;
        }

        // var x = Math.floor(e.x/16),
        //     y = Math.floor(e.y/16);
        piece.x = tile.x;
        piece.y = tile.y;
        piece.loc = tile.loc;
        tile.piece = piece;

        return piece;
    }

    // ****** CHECKING FOR LEGALITY STARTS HERE ******
    game.searchBetweenTiles = function(start, end, step) {
        /* 
          searches between (exclusive) tiles - only allows for linear searches
          i.e. rook, queen, and bishop movements (horizontal/vertical/diagonal)
        */
        for (var i=start+step; i<end; i+=step) {
            if (game.tiles[i].piece !== null)
                return false;
        }
        return true;
    }

    game.searchBetweenTilesNEIGH = function(arr) {
        /* 
          lol function name
          given array of grid numbers, searches if those are being used
          used for knights (horses) because fuck those guys seriously
        */
        for (var i = 0; i < arr.length; i++) {
            if (games.tiles[i].piece !== null)
                return false;
        }
        return true;
    }

    game.checkHorizontalTiles = function(locPiece, locTile) {
        /* 
          checks to see if a piece can move horizontally legally
        */
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece,
            diff = locTile-locPiece;

        if (Math.abs(diff) < 8) {
            var leftEndTile = 8*Math.floor(locTile/8),
                rightEndTile = leftEndTile + 7;

            if (!(locPiece >= leftEndTile && locPiece <= rightEndTile))
                return false;

            return game.searchBetweenTiles(i,N,1);
        }
        return false;
    }

    game.checkVerticalTiles = function(locPiece, locTile) {
        /* checks to see if a piece can move vertically legally */
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece,
            diff = locTile-locPiece;

        if (Math.abs(diff)%8 === 0)
            return game.searchBetweenTiles(i,N,8);

        return false;
    }

    game.checkDiagonalTiles = function(locPiece, locTile) {
        /* checks to see if a piece can move diagonally legally */

        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece,
            diff = locTile-locPiece;

        if (Math.abs(diff)%7 === 0)
            return game.searchBetweenTiles(i,N,7);
        else if (Math.abs(diff)%9 === 0)
            return game.searchBetweenTiles(i,N,9);

        return false;
    }

    game.checkLegalPawn = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        /* 
          checks to see if a pawn can move legally.
        */
        var diff = locTile-locPiece;

        if (pieceID[0] === 'w') {
            // standard movement
            if (diff === -8 && !occupied)
                return true;
            // first move can be two spaces forward
            else if (diff === -16 && !occupied && !hasMoved)
                return game.checkVerticalTiles(locPiece,locTile);
            // attacking
            else if ((diff === -7 || diff === -9) && occupied)
                return true;
        } else {
            if ((diff) === 8 && !occupied)
                return true;
            else if (diff === 16 && !occupied && !hasMoved)
                return game.checkVerticalTiles(locPiece,locTile);
            else if ((diff === 7 || diff === 9) && occupied)
                return true;
        }
        return false;
    }

    game.checkLegalKing = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        /*
          checks to see if a king can move legally.
        */
        var diff = locTile-locPiece,
            locRook;

        // check basic movement and killing
        if (pieceID[0] === 'w') {
            if ((!occupied && (diff === -7 || diff === -8 ||  diff === -9)) || // movement
              (occupied && (Math.abs(diff) === 1 || Math.abs(diff) === 7 || // killing
              Math.abs(diff) === 8 || Math.abs(diff) === 9)))               // killing
                return true; // god, why have ye forsaken me

            locRook = (locTile === 58) ? 56 : 63;

        } else {
            if ((!occupied && (diff === 7 || diff === 8 ||  diff === 9)) ||
              (occupied && (Math.abs(diff) === 1 || Math.abs(diff) === 7 || 
              Math.abs(diff) === 8 || Math.abs(diff) === 9)))
                return true;

            locRook = (locTile === 2) ? 0 : 7;
        }

        // check for castling
        if (Math.abs(diff) === 2 && !hasMoved) {
            var rook = game.tiles[locRook].piece;

            if (rook.id[1] === 'r' && game.checkHorizontalTiles(locPiece, locRook) && !rook.hasMoved) {
                if (locRook >= 56)
                    locRook = (locTile === 58) ? 59 : 61;
                else
                    locRook = (locTile === 2) ? 3 : 5;

                game.movePiece(rook, game.tiles[locRook]);
                return true;
            }
        }
        return false;
    }

    /*
    All other pieces follow the same format: check for correct movement, then check to see if 
    anything was actually blocking its movement (check for tile occupation in between starting 
    point and ending point).
    */
    game.checkLegalHorse = function(locPiece, locTile) {
        var diff = locTile-locPiece;

        if (Math.abs(diff) === 6 || Math.abs(diff) === 10 || 
          Math.abs(diff) === 15 || Math.abs(diff) === 17)
            return true;

        return false;
    }

    game.checkLegalRook = function(locPiece, locTile) {
        return (game.checkHorizontalTiles(locPiece, locTile) || 
            game.checkVerticalTiles(locPiece, locTile));
    }

    game.checkLegalBishop = function(locPiece, locTile) {
        return game.checkDiagonalTiles(locPiece, locTile);
    }

    game.checkLegalQueen = function(locPiece, locTile) {
        return (game.checkVerticalTiles(locPiece, locTile) || 
            game.checkHorizontalTiles(locPiece, locTile) || 
            game.checkDiagonalTiles(locPiece, locTile));
    }

    game.checkLegalChecker = function(locPiece, locTile, occupied, pieceID) {
        if (occupied)
            return false;

        var diff = locTile-locPiece;

        if (pieceID[0] === 'w') {
            if (!piece.isKinged && (diff === -7 || diff === -9))
                return true;
            else if (piece.isKinged && (Math.abs(diff) === 7 || Math.abs(diff) === 9))
                return true;
        } else {
            if (!piece.isKinged && (diff === 7 || diff === 9))
                return true;
            else if (piece.isKinged && (Math.abs(diff) === 7 || Math.abs(diff) === 9))
                return true;
        }
        return false;
    }

    game.isLegalMove = function(piece, tile, occupied) {
        /*
          check to see if a piece's move is legal.
          essentially, call appropriate function.
        */
        var pieceID = piece.id,
            locTile = tile.loc,
            locPiece = piece.loc;

        if (!piece.isChessPiece)
            return game.checkLegalChecker(locPiece, locTile, occupied, pieceID);

        switch(pieceID[1]) {

            case 'p': // pawn
                return game.checkLegalPawn(locPiece, locTile, piece.hasMoved, occupied, pieceID);
                break;

            case 'r': // rook
                return game.checkLegalRook(locPiece, locTile);
                break;

            case 'b': // bishop
                return game.checkLegalBishop(locPiece, locTile);
                break;

            case 'q':
                return game.checkLegalQueen(locPiece, locTile);
                break;

            case 'h':
                return game.checkLegalHorse(locPiece, locTile);
                break;

            case 'k':
                return game.checkLegalKing(locPiece, locTile, piece.hasMoved, occupied, pieceID);
                break;

            default:
                return false;
        }
    }

    game.killPiece = function(locTile) {
        /*
          removes a piece based off its location (underlying tile).
          this is called when a piece is taken.
        */
        game.rootScene.removeChild(game.tiles[locTile].piece);
        game.resetTileState(locTile);
    }

    game.resetBoardAttributes = function() {
        /*
          this function is called after a piece moves or a piece is taken.
        */
        game.activePiece = null;
        game.isPieceSelected = false;
    }

    game.resetTileState = function(locTile) {
        /* 
          removes tile's pointer to its occupying piece after it moves.
        */
        game.tiles[locTile].occupied = false;
        game.tiles[locTile].piece = null;
    }
    
    game.createTile = function(i, j, occupied) {
        /*
          create a tile. attributes:
          - (object) piece: piece occupying tile.
          - (int) loc: grid number between 0 and 63 (inclusive). this represents
                        the location of the tile, where 0 is top left corner and 
                        63 is bottom right corner.
          - (bool) occupied: true if tile has piece occupying it, false otherwise.
        */
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
        tile.piece = null;
        
        tile.addEventListener(Event.TOUCH_START, function(e) {

            console.log(this.occupied)

            if (game.isPieceSelected) {
                piece = game.activePiece;

                var locPiece = piece.loc,
                    locTile = this.loc,
                    diff = locTile-locPiece;

                // checks for basic movement
                if (game.isLegalMove(piece, this, this.occupied)) {
                    game.resetTileState(piece.loc);
                    this.piece = game.movePiece(piece, this, e);
                    game.resetBoardAttributes();
                    return;
                }

                // checks for checkers pieces jumping
                if (!piece.isChessPiece) {
                    var flag = false;

                    if (piece.id[0] === 'w') {
                        if ((!piece.isKinged && (diff === -14 || diff === -18)) || // unkinged jump
                          (piece.isKinged && (Math.abs(diff) === 14 || Math.abs(diff) === 18))) // kinged jump
                            flag = true;
                    } else {
                        if ((!piece.isKinged && (diff === 14 || diff === 18)) || 
                          (piece.isKinged && (Math.abs(diff) === 14 || Math.abs(diff) === 18)))
                            flag = true;
                    }

                    if (flag) {
                        var locKilledPiece = parseInt(Math.abs(locPiece+locTile)/2);
                        game.killPiece(locKilledPiece);
                        game.resetTileState(locKilledPiece);
                        game.movePiece(piece, tile, e);
                        game.resetBoardAttributes();
                        return;
                    }
                }
            }
        });
        return tile;
    }
    
    game.createPiece = function(x, y, frame, id) {
        /*
          create a piece. attributes:
          - (str) id: easy way to represent type of piece.
                      e.g. black pawn --> 'bp'
          - (int) loc: grid number between 0 and 63 (inclusive). this represents
                       the tile the piece is on.
          - (bool) isKinged: king status of checkers piece.
          - (bool) hasMoved: has the piece moved yet?
          - (bool) isChessPiece: true if chess piece, false otherwise.
        */
        var piece = new Sprite(16,16);
        piece.image = (id[0] === 'w') ? game.assets['/public/img/icon1.png'] : 
                        game.assets['/public/img/icon2.png'];
        piece.frame = frame;
        piece.x = 16*x;
        piece.y = 16*y;
        piece.id = id; // e.g. bp1 (black pawn 1)

        piece.loc = x + 8*y;  // grid number
        piece.hasMoved = false; // useful for pawns & castling
        piece.isChessPiece = true;
        piece.isKinged = false;
        
        piece.addEventListener(Event.TOUCH_END, function(e) {

            if (game.isPieceSelected) {
                var activePiece = game.activePiece;

                // if the two pieces are the same colour, just change active piece;
                // unless first piece is a king, then player could be trying to castle.
                if (this.id[0] === activePiece.id[0]) {
                    game.activePiece = this;
                    return;
                }

                if (game.isLegalMove(activePiece, game.tiles[this.loc], true)) {
                    game.killPiece(this.loc);
                    game.resetTileState(activePiece.loc);
                    game.movePiece(activePiece, game.tiles[this.loc], e);
                    game.resetBoardAttributes();
                    return;
                }
            }
            game.isPieceSelected = true;
            game.activePiece = this;
        });
        return piece;
    }

    game.addGameObjects = function(i, j, occupied, pieceFrame, pieceID) {
        /* 
          add a tile to the game and create a pointer to the piece occupying it
          thank you based god for shallow copying
        */
        var tile = game.createTile(i,j,occupied),
            piece = game.createPiece(i,j,pieceFrame,pieceID);
        tile.piece = piece;
        game.tiles[tile.loc] = tile;
        game.rootScene.addChild(tile);
        game.pieces[piece.loc] = piece;
    }
    
    game.onload = function () {
        // for for for for for for for
        // create tiles and pieces
        for (var i=0; i<8; i++) {
            game.addGameObjects(i,0,true,frames[i],'b'+IDs[i]);
            game.addGameObjects(i,1,true,5,'bp');
            game.addGameObjects(i,6,true,5,'wp');
            game.addGameObjects(i,7,true,frames[i],'w'+IDs[i]);
        }
        for (var j=2; j<6; j++) {
            for (var i=0; i<8; i++) {
                var tile = game.createTile(i,j,false);
                game.tiles[tile.loc] = tile;
                game.rootScene.addChild(tile);
            }
        }
        for (var key in game.pieces)
            game.rootScene.addChild(game.pieces[key]);
    }
    
    game.start();
}