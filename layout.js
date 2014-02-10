'use strict';

function layoutBlock(parent, x, y) {
	// Orig X/Y doesn't force the position
    this.origX = x;
	this.origY = y;

	this.width = 0;
	this.height = 0;
	this.x = 0;
	this.y = 0;

	this.parent = parent;
}

layoutBlock.prototype = {
    
};

function layoutManager() {
    var DEFAULT_FLAG = 0;
    var that = {};

    that.createGrid = function (row, col) {
        that.row = row;
        that.col = col;
        that.elem = [];
        for (var i = 0 ; i < row * col ; ++ i) {
            var pos = toRowCol(that, i);
            var G = new layoutBlock(this, pos.row, pos.col);
			G.width = 1;
			G.height = 1;
            G.name = "" + i;
            that.elem.push(G);
        }
    };

    function toIndex (T, row, col) {
        return col * T.row + row;
    };

    function toRowCol (T, index) {
        return {
            row: index % T.row,
            col: Math.floor(index / T.row)
        };
    };

    function getMapFlag (T, row, col) {
        return T.map[toIndex(T, row, col)];
    };

    function isTaken (T, row, col) {
        return getMapFlag(T, row, col) != 0;
    };

    function isFree (T, row, col) {
        return ! isTaken(T, row, col);
    }

    function tooSmall(T, row, col, width, height) {
        if ( row + height > that.row ) {
            return true;
        }

        for ( var i = row ; i < row + height ; ++ i ) {
            if ( getMapFlag(T, i, col) != 0 ) {
                return true;
            }
        }

        for ( var i = col ; i < col + width ; ++ i ) {
            if ( getMapFlag(T, row, i) != 0 ) {
                return true;
            }
        }

        return false;
    }

    function extendMap(T) {
        // Extend a column at the righmost
        for ( var i = 0 ; i < T.row ; ++ i ) {
            T.map.push(DEFAULT_FLAG);
        }
        T.col++;
    }

    function findNextFreeMap(T, current) {
        if ( current == null ) { current = 0; }

        for ( var i = current ; i < T.map.length ; ++ i ) {
            if ( T.map[i] === 0 ) {
                return i;
            }
        }

        // No more free block(s) available
        // a.k.a. may need to extend a column
        return -1;
    }

    function setMapFlag (T, row, col, flag, width, height) {
        if ( width == null ) { width = 1; }
        if ( height == null ) { height = 1; }

        if ( width == 1 && height == 1 ) {
            var pos = toIndex(T, row, col);
            if ( pos >= T.map.length ) {
                extendMap(that);
            }
            T.map[toIndex(T, row, col)] = flag;
        } else {
            for ( var i = 0 ; i < width ; ++ i ) {
                for ( var j = 0 ; j < height ; ++ j ) {
                    var y = row + j;
                    var x = col + i;
                    setMapFlag(T, y, x, flag);
                }
            }
        }

        return flag;
    };

	that.fit = function (fillAllBlanks) {
        if ( fillAllBlanks == null ) { fillAllBlanks = false; }
        
		var gridCount = that.row * that.col;
        that.map = new Array();

		for ( var i = 0 ; i < gridCount ; ++ i ) {
            that.map.push(DEFAULT_FLAG);
		}

        var mapIndex = 0;
		for ( var i = 0 ; i < that.elem.length ; ++ i ) {
			var G = that.elem[i];

            if ( fillAllBlanks ) {
                mapIndex = findNextFreeMap(that);
                if ( mapIndex == -1 ) {
                    extendMap(that);
                    mapIndex = findNextFreeMap(that);
                }
            }

            var mapPos = toRowCol(that, mapIndex);
            while ( isTaken(that, mapPos.row, mapPos.col)
                 || tooSmall(that, mapPos.row, mapPos.col, G.width, G.height) ) {
                var oldIndex = mapIndex;
                mapIndex = findNextFreeMap(that, mapIndex);

                if ( mapIndex == -1 ) {
                    extendMap(that);
                    mapIndex = findNextFreeMap(that, oldIndex);
                } else {
                    if ( tooSmall(that, mapPos.row, mapPos.col, G.width, G.height) ) {
                        extendMap(that);
                        mapIndex = findNextFreeMap(that, mapIndex + 1);
                    }
                }

                mapPos = toRowCol(that, mapIndex);
            }
            G.x = mapPos.col;
            G.y = mapPos.row;
            setMapFlag(that, mapPos.row, mapPos.col, G.name, G.width, G.height);

            mapIndex = findNextFreeMap(that, mapIndex);
		}

        console.log(that.map);
        console.log(that.elem);
	};
    
    return that;
};