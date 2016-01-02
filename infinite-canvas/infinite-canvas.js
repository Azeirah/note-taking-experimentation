var configuration = {
    chunkWidth: 384,
    chunkHeight: 216
};

Math.constrain = function constrain(value, minimum, maximum) {
    "use strict";
    if (value < minimum) return minimum;
    if (value > maximum) return maximum;
    return value;
}

function fitCanvasToScreen(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initializeCanvas() {
    // create the canvas
    var canvas = document.createElement("canvas");

    // make sure canvas is always fullscreen
    fitCanvasToScreen(canvas);
    window.addEventListener("resize", fitCanvasToScreen.bind(null, canvas));

    // append canvas to page
    document.body.appendChild(canvas);

    // create an offscreen canvas to render chunks on
    var offscreenRenderCanvas    = document.createElement("canvas");
    offscreenRenderCanvas.width  = configuration.chunkWidth;
    offscreenRenderCanvas.height = configuration.chunkHeight;

    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;

    return {
        ctx: ctx,
        canvas: canvas,
        offscreenRenderCanvas: offscreenRenderCanvas,
        offscreenRenderCtx: offscreenRenderCanvas.getContext("2d")
    };
}

function initializeWorld(drawing) {
    // This function needs to take into account asynchronous loading of width, height and padding data later!
    var world = {
        position: {
            x: 0,
            y: 0
        },
        width: drawing.canvas.width,
        height: drawing.canvas.height,
        chunks: {}
    };

    function constructChunkKey(x, y) {
        return x.toString() + ", " + y.toString();
    }

    function parseChunkKey(key) {
        var split = key.split(", ");

        return {
            x: parseInt(split[0]),
            y: parseInt(split[1])
        };
    }

    function worldCoordToChunkCoord(x, y) {
        // Takes a position in the world
        // returns the coordinate of the grid this position lies in

        return {
            x: Math.floor(x / configuration.chunkWidth),
            y: Math.floor(y / configuration.chunkHeight)
        };
    }

    function chunkCoordToWorldCoord(x, y) {
        return {
            x: x * configuration.chunkWidth,
            y: y * configuration.chunkHeight
        };
    }

    function chunkCoordToRenderCoord(x, y) {
        // returns the top-left coord; (0, 0) relative to the chunk
        return {
            x: (x * configuration.chunkWidth) - world.position.x,
            y: (y * configuration.chunkHeight) - world.position.y
        };
    }

    function renderCoordToChunkCoord(x, y) {
        // takes a point relative to the canvas, returns the coord of the chunk it's in
        return {
            x: Math.floor((x - world.position.x) / configuration.chunkWidth),
            y: Math.floor((y - world.position.y) / configuration.chunkHeight)
        };
    }

    function getChunk(x, y) {
        // we serialize the coordinate of a chunk with a key, computed from it's x and y coordinates
        // say we have a chunk at {x: 1, y: 3}, then our chunks dict looks like
        // {
        //  ...
        //  "1, 3": ..chunkData
        //  ...
        // }
        var chunkKey = constructChunkKey(x, y);
        var chunk;

        // if the chunk doesn't exist, create it!
        if (Object.keys(world.chunks).indexOf(chunkKey) === -1) {
            world.chunks[chunkKey] = drawing.ctx.createImageData(configuration.chunkWidth, configuration.chunkHeight);
        }

        // now that we're sure that it exists, return the motherfucker <3
        return world.chunks[chunkKey];
    }

    window.addEventListener("resize", function(event) {
        world.width = Math.max(drawing.canvas.width, world.width);
        world.height = Math.max(drawing.canvas.height, world.height);
    });

    function renderChunks(chunks) {
        var coords = Object.keys(chunks).map(parseChunkKey);

        coords.forEach(function(coord) {
            var chunk = getChunk(coord.x, coord.y);
            var renderCoordinate = chunkCoordToRenderCoord(coord.x, coord.y);

            drawing.ctx.putImageData(chunk, renderCoordinate.x, renderCoordinate.y);
        });
    }

    function getChunksInViewport() {
        var chunksInViewport = {};

        // we need to figure out what chunks are in the viewport
        // what we need to do is find the coordinates of the chunks in the four corners
        // and then retrieve those chunks, as well as all chunks inbetween those corners
        var topLeft     = worldCoordToChunkCoord(world.position.x, world.position.y);
        var topRight    = worldCoordToChunkCoord(world.position.x + drawing.canvas.width, world.position.y);
        var bottomLeft  = worldCoordToChunkCoord(world.position.x, world.position.y + drawing.canvas.height);
        var bottomRight = worldCoordToChunkCoord(world.position.x + drawing.canvas.width, world.position.y + drawing.canvas.height);

        var chunksOnXAxis = Math.abs(topRight.x - topLeft.x);
        var chunksOnYAxis = Math.abs(topRight.y - bottomRight.y);

        // <= instead of < because we definitely need to include the outer layer of chunks as well!
        for (var x = 0; x <= chunksOnXAxis; x++) {
            for (var y = 0; y <= chunksOnYAxis; y++) {
                // at this point I wish javascript dictionaries were like python dicts
                // that can take immutable tuples as keys ;_;
                var chunkKey = constructChunkKey(topLeft.x + x, topLeft.y + y);
                chunksInViewport[chunkKey] = getChunk(topLeft.x + x, topLeft.y + y);
            }
        }

        return chunksInViewport;
    }

    world.updateChunks = function () {
        // alternative approach, we use a second canvas
        // 1. Create second canvas
        // 2. for all chunks
        //   2a. altCtx.putImageData(chunk)
        //   2b. visibleData = ctx.getImageData(visible)
        //   2c. altCtx.putImageData(visibleData, visible.x, visible.y)
        //   2d. chunk = altCtx.getImageData(0, 0, chunkWidth, chunkHeight)
        // this way we won't have to manually loop over all pixels (which is STUPIDLY slow)
        // and we won't have to distinguish between clipping and visible chunks anymore,
        // only determine the area that's visible, which is (A.x, A.y:D.x, D.y) for entirely visible chunks
        var chunks = getChunksInViewport();

        Object.keys(chunks).forEach(function (key) {
            var coord       = parseChunkKey(key);
            var renderCoord = chunkCoordToRenderCoord(coord.x, coord.y);
            var chunk       = chunks[key];

            // the Math.constrain calls are to ensure that we do not overwrite partially clipped chunks with whitespace
            // top-left
            var A = {
                x: Math.constrain(renderCoord.x, 0, drawing.canvas.width),
                y: Math.constrain(renderCoord.y, 0, drawing.canvas.height)
            };
            // bottom-right
            var D = {
                x: Math.constrain(renderCoord.x + configuration.chunkWidth,  0, drawing.canvas.width),
                y: Math.constrain(renderCoord.y + configuration.chunkHeight, 0, drawing.canvas.height)
            };

            var width  = D.x - A.x;
            var height = D.y - A.y;

            // don't even bother to update chunks that are not even visible on the canvas! :o
            if (width <= 0 || height <= 0) return;

            var putLocation = {
                x: configuration.chunkWidth - width,
                y: configuration.chunkHeight - height
            };

            var chunkWorldCoord = chunkCoordToWorldCoord(coord.x, coord.y);
            var canvas_A = {
                x: world.position.x,
                y: world.position.y
            };

            var canvas_D = {
                x: world.position.x + drawing.canvas.width,
                y: world.position.y + drawing.canvas.height
            };

            // I know there's a LOT of redundancy down here
            // I was having an extremely bad time figuring out how to deal with the clipped chunks
            // in all cases, and I'm 100% certain I've missed at least one, but I haven't been able to reproduce it.
            // at some point, the bottom-right clipping chunk was glitching out because of bad putLocation values
            //
            // I first want to make sure that all cases are covered, when I did that, I can get rid of all the
            // heavily unnecessary redundancy here

            // bottom-left clipped chunk
            if (chunkWorldCoord.x <= canvas_A.x &&
                chunkWorldCoord.y + configuration.chunkHeight >= canvas_D.y &&
                height < configuration.chunkHeight) {
                putLocation.y = 0;
            }

    	    // bottom-mid clipped chunk
    	    if (chunkWorldCoord.x >= canvas_A.x &&
        		chunkWorldCoord.y + configuration.chunkHeight >= canvas_D.y &&
        		width === configuration.chunkWidth &&
        		height < configuration.chunkHeight) {
        		putLocation.x = 0;
        		putLocation.y = 0;
    	    }

    	    // bottom-right clipped chunk
    	    if (chunkWorldCoord.x >= canvas_A.x &&
    	        chunkWorldCoord.y + configuration.chunkHeight >= canvas_D.y &&
        		width < configuration.chunkWidth &&
        		height < configuration.chunkHeight) {
                putLocation.x = 0;
    		    putLocation.y = 0;
    	    }

    	    // middle-right clipped chunk
            if (chunkWorldCoord.x >= canvas_A.x &&
        		chunkWorldCoord.y + configuration.chunkHeight <= canvas_D.y &&
        		width < configuration.chunkWidth &&
        		height === configuration.chunkHeight) {
                putLocation.x = 0;
    	        putLocation.y = 0;
    	    }

            // top-right clipped chunk
            if (chunkWorldCoord.x >= canvas_A.x &&
                chunkWorldCoord.y + configuration.chunkHeight <= canvas_D.y &&
                width < configuration.chunkWidth) {
                    putLocation.x = 0;
            }

            // ..simply load the chunk into the render context, nothing special here
            drawing.offscreenRenderCtx.putImageData(chunk, 0, 0);
            // ..now get the corresponding data from the canvas and put it into the chunk
            // clear the chunk beforehand, otherwise transparent pixels (anti-aliasing) will accumulate
            // resulting in ugly thick lines
            drawing.offscreenRenderCtx.clearRect(putLocation.x, putLocation.y, width, height);
            drawing.offscreenRenderCtx.drawImage(drawing.canvas, A.x, A.y, width, height, putLocation.x, putLocation.y, width, height);
            // ..overwrite the storage chunk to the just rendered one
            world.chunks[key] = drawing.offscreenRenderCtx.getImageData(0, 0, configuration.chunkWidth, configuration.chunkHeight);
        });
    };

    world.moveBy = function(dx, dy, canvas) {
        world.position.x += dx;
        world.position.y += dy;

        var chunksToRender = getChunksInViewport();
        renderChunks(chunksToRender);
    };

    return world;
}

function handleMouseEvents(drawing, world) {
    var ctx = drawing.ctx;
    var canvas = drawing.canvas;

    function padTheWorld(event) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        world.moveBy(-event.dx, -event.dy);
    }

    function drawALine(event) {
        ctx.beginPath();
        ctx.moveTo(event.previousMousePosition.clientX, event.previousMousePosition.clientY);
        ctx.lineTo(event.clientX, event.clientY);
        ctx.stroke();
    }

    window.addEventListener("resize", function() {
        // moving forces a rerender
        world.moveBy(0, 0);
    });

    canvas.addEventListener("az-drag", function(event) {
        if (event.which === MOUSE.middle) {
            padTheWorld(event);
        } else if (event.which === MOUSE.left) {
            drawALine(event);
        }
    });

    canvas.addEventListener("az-dragEnd", function(event) {
        if (event.which === MOUSE.left) {
            // there's a problem with update chunks, for a chunk it's possible to reside outside the canvas only halfway for example
            // when the canvas tries to update that chunk, it will overwrite his clipped data with 0's, you will lose the clipped data!
            world.updateChunks();
        }
    });

    // prevents the annoying scrolling popup thing on middle mouse click
    window.addEventListener("mousedown", function(event) {
        if (event.which === MOUSE.middle) {
            event.preventDefault();
        }
    });
}

var drawing = initializeCanvas();
var world = initializeWorld(drawing);

handleMouseEvents(drawing, world);

function findAllNonEmptyChunks() {
    var keys = Object.keys(world.chunks).filter(function(chunkKey) {
        return world.chunks[chunkKey].data.reduce(function(d, p) {
            return d + p
        }, 0) !== 0;
    });

    console.log(keys);
}
