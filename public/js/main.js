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

    // game.tileInfo = {0:'br',1:'bh',2:'bb',3:'bq',4:'bk',5:null,6:null,7:null,8:null,9:'bp1'};
    game.tileInfo = {};
    for (var i=16; i<48; i++)
        game.tileInfo[i] = null;

    var frames = [6,2,7,1,0,7,2,6],
        idBlack = ['br','bh','bb','bq','bk','bb','bh','br'],
        idWhite = ['wr','wh','wb','wq','wk','wb','wh','wr'];

    game.allTiles = {};
    game.allPieces = {};


    game.movePiece = function(piece, tile, e) {
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

        var x = Math.floor(e.x/16),
            y = Math.floor(e.y/16);
        piece.x = 16*x;
        piece.y = 16*y;
        // update location info
        game.tileInfo[piece.loc] = null;
        piece.loc = x + 8*y;
        game.tileInfo[piece.loc] = piece.id;
        tile.piece = piece;
        // no piece should be selected anymore
        game.isPieceSelected = false;
        game.activePiece = null;

        return piece;
    }

    // ****** CHECKING FOR LEGALITY STARTS HERE ******
    game.searchBetweenTiles = function(start, end, step) {
        // searches between (exclusive) tiles - only allows for linear searches
        // i.e. rook, queen, and bishop movements (horizontal/vertical/diagonal)
        for (var i=start+step; i<end; i+=step) {
            if (game.tileInfo[i] !== null)
                return false;
        }
        return true;
    }

    game.searchBetweenTilesNEIGH = function(arr) {
        // lol function name
        // given array of grid numbers, searches if those are being used
        // used for knights (horses) because fuck those guys seriously
        for (var i = 0; i < arr.length; i++) {
            if (games.tileInfo[i] !== null)
                return false;
        }
        return true;
    }

    game.moveHorizontal = function(locPiece, locTile) {
        // checks to see if a piece can move horizontally legally
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

    game.moveVertical = function(locPiece, locTile) {
        // checks to see if a piece can move vertically legally
        var i = (locPiece < locTile) ? locPiece : locTile,
            N = (locPiece < locTile) ? locTile : locPiece,
            diff = locTile-locPiece;

        if (Math.abs(diff)%8 === 0)
            return game.searchBetweenTiles(i,N,8);

        return false;
    }

    game.moveDiagonal = function(locPiece, locTile) {
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
        This checks for the colour of the piece first, as that matters for pawns. Then, it 
        checks for standard movement (1 forward), abnormal movement (2 forward on first move) 
        and then for killing.
        */
        var diff = locTile-locPiece;

        if (pieceID[0] === 'w') {
            // standard movement
            if (diff === -8 && !occupied)
                return true;
            // first move can be two spaces forward
            else if (diff === -16 && !occupied && !hasMoved)
                return game.moveVertical(locPiece,locTile);
            // attacking
            else if ((diff === -7 || diff === -9) && occupied)
                return true;
        } else {
            if ((diff) === 8 && !occupied)
                return true;
            else if (diff === 16 && !occupied && !hasMoved)
                return game.moveVertical(locPiece,locTile);
            else if ((diff === 7 || diff === 9) && occupied)
                return true;
        }

        return false;
    }

    game.checkLegalKing = function(locPiece, locTile, hasMoved, occupied, pieceID) {
        // hasMoved will be required for castling.
        var diff = locTile-locPiece;

        if (pieceID[0] === 'w') {
            if (diff === -7 || diff === -8 ||  diff === -9)
                return true;
        } else {
            if (diff === 7 || diff === 8 || diff === 9)
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
        var diff = locTile-locPiece;

        if (Math.abs(diff) === 6 || Math.abs(diff) === 10 || Math.abs(diff) === 15 || 
            Math.abs(diff) === 17)
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

    game.isLegalMove = function(piece, locTile, occupied) {
        // check for piece type. call appropriate function.
        pieceID = piece.id;
        if (!piece.isChessPiece)
            return game.checkLegalChecker(piece.loc, locTile, occupied, pieceID);

        switch(pieceID[1]) {

            case 'p': // pawn
                return game.checkLegalPawn(piece.loc, locTile, piece.hasMoved, occupied, pieceID);
                break;

            case 'r': // rook
                return game.checkLegalRook(piece.loc, locTile);
                break;

            case 'b': // bishop
                return game.checkLegalBishop(piece.loc, locTile);
                break;

            case 'q':
                return game.checkLegalQueen(piece.loc, locTile);
                break;

            case 'h':
                return game.checkLegalHorse(piece.loc, locTile);
                break;

            case 'k':
                return game.checkLegalKing(piece.loc, locTile, piece.hasMoved, occupied, pieceID);
                break;

            default:
                return false;
        }
    }
    
    game.createTile = function(i, j, occupied, pieceFrame, pieceID) {
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

            if (game.isPieceSelected) {
                piece = game.activePiece;

                if (game.isLegalMove(piece, this.loc, this.occupied)) {
                    game.allTiles[piece.loc].piece = null;
                    piece = game.movePiece(piece, this, e);
                    this.piece = piece;
                    return;
                }

                if (!piece.isChessPiece) {
                    var locPiece = piece.loc,
                        locTile = this.loc,
                        diff = locTile-locPiece,
                        flag = false;

                    if (piece.id[0] === 'w') {
                        if ((!piece.isKinged && (diff === -14 || diff === -18)) || 
                            (piece.isKinged && (Math.abs(diff) === 14 || Math.abs(diff) === 18)))
                                flag = true;
                    } else {
                        if ((!piece.isKinged && (diff === 14 || diff === 18)) || 
                            (piece.isKinged && (Math.abs(diff) === 14 || Math.abs(diff) === 18)))
                                flag = true;
                    }

                    if (flag) {
                        var locKilledPiece = parseInt(Math.abs(locPiece+locTile)/2);
                        game.rootScene.removeChild(game.allTiles[locKilledPiece].piece);
                        piece = game.movePiece(piece, this, e);
                        this.piece = piece;
                        return;
                    }
                }
            }
        });
        return tile;
    }
    
    game.createPiece = function(x, y, frame, id) {
        var piece = new Sprite(16,16);
        piece.image = game.assets['/public/img/icon1.png'];
        piece.frame = frame;
        piece.x = 16*x;
        piece.y = 16*y;
        piece.id = id; // e.g. bp1 (black pawn 1)

        piece.loc = x + 8*y;  // grid number
        piece.hasMoved = false; // useful for pawns & castling
        piece.isChessPiece = true;
        piece.isKinged = false;
        game.tileInfo[piece.loc] = piece.id;
        
        piece.addEventListener(Event.TOUCH_END, function(e) {

            if (game.isPieceSelected) {
                var activePiece = game.activePiece;

                if (this.id[0] === activePiece.id[0]) {
                    game.activePiece = this;
                    return;
                }

                if (game.isLegalMove(activePiece, this.loc, true)) {
                    game.rootScene.removeChild(this);
                    activePiece = game.movePiece(activePiece, this.loc, e);
                    game.activePiece = null;
                    game.isPieceSelected = false;
                    return;
                }
            }
            game.isPieceSelected = true;
            game.activePiece = this;
        });
        return piece;
    }

    game.addGameObjects = function(i, j, occupied, pieceFrame, pieceID) {
        var tile = game.createTile(i,j,occupied),
            piece = game.createPiece(i,j,pieceFrame,pieceID);
        tile.piece = piece;
        game.allTiles[tile.loc] = tile;
        game.rootScene.addChild(tile);
        game.allPieces[piece.loc] = piece;
    }
    
    game.onload = function () {
        // for for for for for for for
        // create tiles and pieces
        for (var i=0; i<8; i++)
            game.addGameObjects(i,0,true,frames[i],idBlack[i]);
        for (var i=0; i<8; i++)
            game.addGameObjects(i,1,true,5,'bp');
        for (var j=2; j<6; j++) {
            for (var i=0; i<8; i++) {
                var tile = game.createTile(i,j,false);
                game.allTiles[tile.loc] = tile;
                game.rootScene.addChild(tile);
            }
        }
        for (var i=0; i<8; i++)
            game.addGameObjects(i,6,true,5,'wp');
        for (var i=0; i<8; i++)
            game.addGameObjects(i,7,true,frames[i],idWhite[i]);

        for (var key in game.allPieces)
            game.rootScene.addChild(game.allPieces[key]);
    }
    
    game.start();
}