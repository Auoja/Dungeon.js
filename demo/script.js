function startDemo() {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');

    var width = 100;
    var height = 100;

    var res = 5;

    canvas.width = width * res;
    canvas.height = height * res;

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var dungeon = Dungeon.generateDungeon(width, height, 100, 5, 15);

    function renderSquare(x, y, color) {
        for (var i = x * res; i < x * res + res; i++) {
            for (var j = y * res; j < y * res + res; j++) {
                var index = (i + j * imageData.width) * 4;
                imageData.data[index + 0] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = 255;
            }
        }
    }

    var wallRender = function(x, y) {
        renderSquare(x, y, {
            r: 80,
            g: 80,
            b: 80
        });
    };
    var roomRender = function(x, y) {
        renderSquare(x, y, {
            r: 255,
            g: 255,
            b: 255
        });
    };
    var emptyRender = function(x, y) {
        renderSquare(x, y, {
            r: 0,
            g: 0,
            b: 0
        });
    };

    dungeon.iterate(roomRender, undefined, emptyRender);
    ctx.putImageData(imageData, 0, 0);

}