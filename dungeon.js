var Dungeon = (function() {

    var TILE_EMPTY = 1;
    var TILE_WALL = 2;
    var TILE_ROOM = 3;
    var TILE_FORBIDDEN = 4;

    var EAST = parseInt([
        TILE_ROOM, TILE_WALL, TILE_EMPTY,
        TILE_ROOM, TILE_WALL, TILE_EMPTY,
        TILE_ROOM, TILE_WALL, TILE_EMPTY
        ].join(""));

    var WEST = parseInt([
        TILE_EMPTY, TILE_WALL, TILE_ROOM,
        TILE_EMPTY, TILE_WALL, TILE_ROOM,
        TILE_EMPTY, TILE_WALL, TILE_ROOM
        ].join(""));

    var NORTH = parseInt([
        TILE_EMPTY, TILE_EMPTY, TILE_EMPTY,
        TILE_WALL, TILE_WALL, TILE_WALL,
        TILE_ROOM, TILE_ROOM, TILE_ROOM
        ].join(""));

    var SOUTH = parseInt([
        TILE_ROOM, TILE_ROOM, TILE_ROOM,
        TILE_WALL, TILE_WALL, TILE_WALL,
        TILE_EMPTY, TILE_EMPTY, TILE_EMPTY
        ].join(""));

    var generateDungeon = function(width, height, roomCount, minRoomSize, maxRoomSize) {

        var dungeon = [];
        var rooms = [];
        var buildableTiles = [];
        var bounds = {
            xmin: Number.MAX_VALUE,
            ymin: Number.MAX_VALUE,
            xmax: Number.MIN_VALUE,
            ymax: Number.MIN_VALUE
        };

        function setTile(x, y, tile) {
            dungeon[x + y * width] = tile;
        }

        function getTile(x, y) {
            return dungeon[x + y * width];
        }

        function size() {
            return minRoomSize + Math.round(Math.random() * (maxRoomSize - minRoomSize));;
        }

        function getRoomSize() {
            return {
                width: size(),
                height: size()
            };
        }

        function isValid(x, y) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                return false;
            }
            return true;
        }

        function testTileForConstruction(x, y) {
            if (!isValid(x, y)) {
                return 0;
            }
            return parseInt([
                getTile(x - 1, y - 1), getTile(x, y - 1), getTile(x + 1, y - 1),
                getTile(x - 1, y), getTile(x, y), getTile(x + 1, y),
                getTile(x - 1, y + 1), getTile(x, y + 1), getTile(x + 1, y + 1)
                ].join(""));
        }

        function createRoom(x, y, w, h) {
            bounds.xmin = Math.min(bounds.xmin, x - 1);
            bounds.ymin = Math.min(bounds.ymin, y - 1);

            bounds.xmax = Math.max(bounds.xmax, x + w + 1);
            bounds.ymax = Math.max(bounds.ymax, y + h + 1);

            for (var i = x - 1; i < x + w + 1; i++) {
                for (var j = y - 1; j < y + h + 1; j++) {
                    if (i === x - 1 || i === x + w || j === y - 1 || j === y + h) {
                        setTile(i, j, TILE_WALL);
                        buildableTiles.push({
                            x: i,
                            y: j
                        });
                    } else {
                        setTile(i, j, TILE_ROOM);
                    }
                }
            }
        }

        function buildRoom(x, y, w, h, dir) {
            var topleft;

            var dx = Math.floor(w * 0.5);
            var dy = Math.floor(h * 0.5);

            switch (dir) {
                case NORTH:
                    {
                        topleft = {
                            x: x - dx,
                            y: y - h
                        };
                        break;
                    }
                case SOUTH:
                    {
                        topleft = {
                            x: x - dx,
                            y: y + 1
                        };
                        break;
                    }
                case EAST:
                    {
                        topleft = {
                            x: x + 1,
                            y: y - dy
                        };
                        break;
                    }
                case WEST:
                    {
                        topleft = {
                            x: x - w,
                            y: y - dy
                        };
                        break;
                    }
            }

            for (var i = topleft.x; i < topleft.x + w; i++) {
                for (var j = topleft.y; j < topleft.y + h; j++) {
                    if (getTile(i, j) != TILE_EMPTY) {
                        return false;
                    }
                }
            }

            createRoom(topleft.x, topleft.y, w, h);
            setTile(x, y, TILE_ROOM);

            rooms.push({
                x: topleft.x,
                y: topleft.y,
                width: w,
                height: height
            });

            return true;
        }

        function setup() {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    if (isValid(x, y)) {
                        setTile(x, y, TILE_EMPTY);
                    } else {
                        setTile(x, y, TILE_FORBIDDEN);
                    }
                }
            }

            var roomSize = getRoomSize();
            var roomPosition = {
                x: Math.floor(0.5 * width - roomSize.width * 0.5),
                y: Math.floor(0.5 * height - roomSize.height * 0.5)
            };

            createRoom(roomPosition.x, roomPosition.y, roomSize.width, roomSize.height);
            roomCount--;
        }

        function generate() {
            buildableTiles = buildableTiles.filter(function(tile) {
                var type = testTileForConstruction(tile.x, tile.y);
                if (type === NORTH || type === EAST || type === SOUTH || type === WEST) {
                    tile.type = type;
                    return true;
                }
                return false;
            });

            var i = Math.floor(buildableTiles.length * Math.random());
            var roomSize = getRoomSize();

            return buildRoom(buildableTiles[i].x, buildableTiles[i].y, roomSize.width, roomSize.height, buildableTiles[i].type);
        }

        var iterate = function(roomFn, wallFn, emptyFn) {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {

                    switch (getTile(x, y)) {
                        case TILE_ROOM:
                            {
                                if (roomFn) {
                                    roomFn(x, y);
                                    break;
                                }
                            }
                        case TILE_WALL:
                            {
                                if (wallFn) {
                                    wallFn(x, y);
                                    break;
                                }
                            }
                        default:
                        case TILE_FORBIDDEN:
                        case TILE_EMPTY:
                            {
                                if (emptyFn) {
                                    emptyFn(x, y);
                                }
                                break;
                            }
                    }
                }
            }
        }



        setup();

        var failureCounter = 0;
        while (roomCount > 0 && failureCounter < 100) {
            var generated = generate();
            if (generated) {
                failureCounter = 0;
                roomCount--;
            } else {
                failureCounter++;
            }
        }

        return {
            data: dungeon,
            rooms: rooms,
            box: {
                x: bounds.xmin,
                y: bounds.ymin,
                width: bounds.xmax - bounds.xmin,
                height: bounds.ymax - bounds.ymin
            },
            iterate: iterate
        };
    };

    return {
        generateDungeon: generateDungeon
    };

})();