// code.9leap.net default template
// based on enchant.js v0.7.1

enchant();

window.onload = function(){
    var game = new Core(128, 128);
    game.fps = 15;
    game.preload('/public/img/tileset1.png');
    game.preload('/public/img/icon1.png');
    
    game.isPieceSelected = false;
    game.activePiece = null;

    game.locationsUsed = [];

    
    game.addTile = function(i,j,occupied) {
        var tile = new Sprite(16,16);
        tile.image = game.assets['/public/img/tileset1.png'];
        tile.x = 16*i;
        tile.y = 16*j;
        
        if (j%2 === 0)
            tile.frame = (i%2 === 0) ? 0 : 1;
        else
            tile.frame = (i%2 === 0) ? 1 : 0;
        
        tile.occupied = occupied; // initial state of tile
        tile.loc = i + 8*j;       // for checking legality
        
        tile.addEventListener(Event.TOUCH_START, function(e) {

            if (game.isPieceSelected) {

                /* TODO:
                    Check for tile's occupation. If tile is occupied, check 
                    colour of piece. If it's the user's piece, do nothing,
                    otherwise check for a kill.
                */

                var x = Math.floor(e.x/16),
                    y = Math.floor(e.y/16);
                // move piece
                game.activePiece.x = 16*x;
                game.activePiece.y = 16*y;
                // update its "location"
                game.activePiece.loc = x + 8*y;
                // no piece should be selected anymore
                game.isPieceSelected = false;
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
        piece.id = id;
        piece.loc = Math.floor(x/16) + 8*Math.floor(y/16);
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
        
        game.addPiece(16,0,5,"bp1");
        
    }
    
    
    game.start();
};