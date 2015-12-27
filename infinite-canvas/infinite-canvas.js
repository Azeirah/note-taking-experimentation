// I want to make an infinite canvas with the following properties
// 1. The drawn data should persist on the server
// 2. Truly infinite, no borders, not "large enough" either
// 3. Smooth performance

// idea, let's split it up into chunks, each chunk has a width and a height, let's say 384x216 for example

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

// too simple assertion function
function assert(predicate, message) {
    if (!predicate) {
        console.log("Predicate did not hold true,", message);
    }
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

    return {
        ctx: canvas.getContext("2d"),
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

    window.addEventListener("resize", function (event) {
        world.width  = Math.max(drawing.canvas.width, world.width);
        world.height = Math.max(drawing.canvas.height, world.height);
    });

    function renderChunks(chunks) {
        var coords = Object.keys(chunks).map(parseChunkKey);

        coords.forEach(function (coord) {
            var chunk = getChunk(coord.x, coord.y);
            var renderCoordinate = chunkCoordToRenderCoord(coord.x, coord.y);

            drawing.ctx.putImageData(chunk, renderCoordinate.x, renderCoordinate.y);
        });
    }

    function getChunksInViewport () {
        var chunksInViewport = {};

        // we need to figure out what chunks are in the viewport
        // what we need to do is find the coordinates of the chunks in the four corners
        // and then retrieve those chunks, as well as all chunks inbetween those corners
        var topLeft     = worldCoordToChunkCoord(world.position.x                       , world.position.y);
        var topRight    = worldCoordToChunkCoord(world.position.x + drawing.canvas.width, world.position.y);
        var bottomLeft  = worldCoordToChunkCoord(world.position.x                       , world.position.y + drawing.canvas.height);
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


    // the following two functions are huge, awkward and ugly, they desperately need some rewriting.
    function getClippedChunks() {
        // retrieves all chunks that are partially inside and partially outside the viewport
        var chunksInViewport = getChunksInViewport();

        // when is a chunk clipped? It's clipped when
        // at least one of its four corners lie INSIDE the viewport
        // AND
        // at least one of its four corners lie OUTSIDE the viewport
        // the way I compute it feels a little awkward, lol
        var chunkCoords = Object.keys(chunksInViewport).map(parseChunkKey);
        var clippingChunkCoords = chunkCoords.map(function (coord) {return chunkCoordToRenderCoord(coord.x, coord.y)}).filter(function (coord) {
            var inside  = false;
            var outside = false;

            // the four points
            [
                {x: coord.x,                            y: coord.y},
                {x: coord.x + configuration.chunkWidth, y: coord.y},
                {x: coord.x,                            y: coord.y + configuration.chunkHeight},
                {x: coord.x + configuration.chunkWidth, y: coord.y + configuration.chunkHeight}
            ]
            .forEach(function (coord) {
                // for all points, see if they lie inside or outside
                if (coord.x < 0 || coord.x > drawing.canvas.width || coord.y < 0 || coord.y > drawing.canvas.height) {
                    inside = true;
                } else {
                    outside = true;
                }
            });

            // return if the chunk has at least one point INSIDE and at least one point OUTSIDE the viewport
            return inside && outside;
        });

        var clippedChunks = {};

        clippingChunkCoords.forEach(function (renderCoord) {
            var c = renderCoordToChunkCoord(renderCoord.x, renderCoord.y);
            clippedChunks[constructChunkKey(c.x, c.y)] = getChunk(c.x, c.y);
        });

        return clippedChunks;
    }

    function getVisibleChunks() {
        // retrieves all chunks that are entirely visible inside the viewport
        var chunksInViewport = getChunksInViewport();

        // when is a chunk entirely visible? It's entirely visible when
        // ALL of its corners lie inside the viewport.
        var chunkCoords = Object.keys(chunksInViewport).map(parseChunkKey);
        var visibleChunkCoords = chunkCoords.map(function (coord) {return chunkCoordToRenderCoord(coord.x, coord.y)}).filter(function (coord) {
            var inside  = false;
            var outside = false;

            // the four points
            [
                {x: coord.x,                            y: coord.y},
                {x: coord.x + configuration.chunkWidth, y: coord.y},
                {x: coord.x,                            y: coord.y + configuration.chunkHeight},
                {x: coord.x + configuration.chunkWidth, y: coord.y + configuration.chunkHeight}
            ]
            .forEach(function (coord) {
                // for all points, see if they lie inside or outside
                if (coord.x < 0 || coord.x > drawing.canvas.width || coord.y < 0 || coord.y > drawing.canvas.height) {
                    outside = true;
                } else {
                    inside = true;
                }
            });

            // return if the chunk's points all lie inside the viewport
            return inside && !outside;
        });

        var visibleChunks = {};

        visibleChunkCoords.forEach(function (renderCoord) {
            var c = renderCoordToChunkCoord(renderCoord.x, renderCoord.y);
            visibleChunks[constructChunkKey(c.x, c.y)] = getChunk(c.x, c.y);
        });

        return visibleChunks;
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

            // console.log(width, height, configuration.chunkWidth, configuration.chunkHeight);

            // don't attempt to update chunks that are not even visible on the canvas! :o
            if (width <= 0 || height <= 0) return;

            // console.log(A.x, world.position.x % configuration.chunkWidth, A.x + (world.position.x % configuration.chunkWidth) % configuration.chunkWidth);

            // if (width < configuration.chunkWidth || height < configuration.chunkHeight) {
            //     drawing.ctx.fillStyle = "rgba(20, 250, 200, .3)";
            //     console.log(A, D, width, height);
            //     drawing.ctx.fillRect(A.x, A.y, width, height);
            // } else {
            //     drawing.ctx.fillStyle = "white";
            //     drawing.ctx.fillRect(A.x, A.y, width, height);
            // }
            //
            // de bug komt alleen voor bij
            // negatieve geclipte chunks aan de linkerkant OF bovenkant van het scherm
            // dus niet aan de onder- of rechterkant, en alleen wanneer de corresponderende x of y coordinaat negatief is
            //

            // ..simply load the chunk into the render context, nothing special here
            drawing.offscreenRenderCtx.putImageData(chunk, 0, 0);
            // ..now get the corresponding data from the canvas
            var visibleData = drawing.ctx.getImageData(A.x, A.y, width, height);

            var chunkCoord = chunkCoordToWorldCoord(coord.x, coord.y);
            var putLocation = {
                x: 0,
                y: 0,
                // x: Math.constrain(world.position.x, chunkCoord.x, chunkCoord.x + configuration.chunkWidth) - world.position.x,
                // y: Math.constrain(world.position.y, chunkCoord.y, chunkCoord.y + configuration.chunkHeight) - world.position.y,
            };

            if (chunkCoord.x >= world.position.x && chunkCoord.x < world.position.x + configuration.chunkWidth) {
                putLocation.y = world.position.y % configuration.chunkHeight;
            }

            // if (width < configuration.chunkWidth) {
            //     putLocation.x = ;
            // }

            // if (height < configuration.chunkHeight) {
            //     putLocation.y = configuration.chunkHeight - height;
            // }

            // if (putLocation.x < 0) {
                drawing.ctx.fillText(JSON.stringify(putLocation) + ", " + width + ", " + height, A.x + width / 2, A.y + height / 2);
            // }

            // The error lies somewhere here.... I think
            drawing.offscreenRenderCtx.putImageData(visibleData, putLocation.x, putLocation.y);

            // ..set the chunk to the just rendered one
            world.chunks[key] = drawing.offscreenRenderCtx.getImageData(0, 0, configuration.chunkWidth, configuration.chunkHeight);
        });
    };

    // world.updateChunks = function () {
    //     // the update chunk has a problem with chunks that are partially inside and partially outside the canvas viewport
    //     // let's assume all our chunks are completely black,
    //     // now move on of our chunk partially outside the viewport
    //     // when I call update, this chunk will be overwritten with one that's partially white, where it's outside the canvas viewport!
    //     // Because the canvas will return 0's for pixels outside its viewport
    //     // canvas.width = 10
    //     // canvas.height = 10
    //     // canvas.fillRect(0, 0, 10, 10)
    //     // canvas.getImageData(10, 10, 2, 2) -> [black, white,
    //     //                                       white, white]
    //     //
    //     // To solve this, split the viewport chunks into two arrays, those which are entirely visible on the viewport
    //     // and those that are partially outside the viewport
    //     //
    //     // simply overwrite the ones inside the viewport
    //     // and mutate those that are outside the viewport
    //     var clippingChunks        = getClippedChunks();
    //     var entirelyVisibleChunks = getVisibleChunks();

    //     // amount of clipping chunks + amount of visible chunks should equal chunks in viewport at all times!
    //     if (! (Object.keys(getChunksInViewport()).length === Object.keys(clippingChunks).length + Object.keys(entirelyVisibleChunks).length)) {
    //         throw Error("The amount of chunks is not equal to clipping chunks + visible chunks");
    //     }

    //     // first, render all chunks that are entirely visible, there are no complications here
    //     Object.keys(entirelyVisibleChunks).forEach(function (key) {
    //         var coord = parseChunkKey(key);
    //         var renderCoord = chunkCoordToRenderCoord(coord.x, coord.y);

    //         world.chunks[key] = drawing.ctx.getImageData(renderCoord.x, renderCoord.y, configuration.chunkWidth, configuration.chunkHeight);
    //     });

    //     // next, update the clipped chunks, this is a little more complicated.
    //     // we need to figure out what pixels are visible, and what pixels aren't.
    //     // take all visible pixels, and paint them over the existing chunk's pixels
    //     // leave the other pixels alone.
    //     //
    //     // There's a small issue remaining with this, anything that you expect to be painted outside the canvas
    //     // for example, if you're drawing with a circular brush of 20px at the edge of the screen
    //     // you will expect that half of the circle will be drawn "just outside" the canvas
    //     // unfortunately, the canvas buffer doesn't extend outside of the screen, only the chunks do..

    //     // I would prefer to draw directly to the chunks, perhaps that would work better
    //     // but I don't know how that would work yet :(
    //     Object.keys(clippingChunks).forEach(function (key) {
    //         var coord = parseChunkKey(key);
    //         var renderCoord = chunkCoordToRenderCoord(coord.x, coord.y);
    //         // I'm very afraid this will be /really/ slow :(, but whatever
    //         // My proposal for an algorithm
    //         // 1. Find all points that lay inside the viewport
    //         // 2. Find the points where the viewport border intersects the chunk
    //         // 3. Sort the points such that
    //         // A---------------B
    //         // |               |
    //         // |               |
    //         // |               |
    //         // |               |
    //         // C---------------D
    //         // we can now iterate from A to D, copy those points over to the chunk, this is what I fear will be slow :o

    //         drawing.ctx.strokeRect(renderCoord.x, renderCoord.y, configuration.chunkWidth, configuration.chunkHeight);

    //         var A = {
    //             x: Math.constrain(renderCoord.x,                             0, drawing.canvas.width),
    //             y: Math.constrain(renderCoord.y,                             0, drawing.canvas.height)
    //         };
    //         var D = {
    //             x: Math.constrain(renderCoord.x + configuration.chunkWidth,  0, drawing.canvas.width),
    //             y: Math.constrain(renderCoord.y + configuration.chunkHeight, 0, drawing.canvas.height)
    //         };

    //         var chunk = clippingChunks[key];
    //         try {
    //             var canvasChunk = drawing.ctx.getImageData(A.x, A.y, D.x - A.x, D.y - A.y);
    //         } catch(error) {
    //             console.log(`point: (` + A.x + ", " + A.y + ")" + ", width:", D.x - A.x, "height:", D.y - A.y);
    //             console.log(D.x - A.x, D.y - A.y);
    //         }

    //         // now that we have the points, we need to iterate over them
    //         for (var x = A.x; x < D.x; x += 1) {
    //             for (var y = A.y; y < D.y; y += 1) {
    //                 // calculate the index in the chunk
    //                 var index = (x * configuration.chunkWidth + y) * 4;
    //                 chunk.data[index    ] = canvasChunk.data[index    ];
    //                 chunk.data[index + 1] = canvasChunk.data[index + 1];
    //                 chunk.data[index + 2] = canvasChunk.data[index + 2];
    //                 chunk.data[index + 3] = canvasChunk.data[index + 3];
    //             }
    //         }

    //     });
    // };

    world.moveBy = function (dx, dy, canvas) {
        world.position.x += dx;
        world.position.y += dy;

        var chunksToRender = getChunksInViewport();
        renderChunks(chunksToRender);

        Object.keys(chunksToRender).map(parseChunkKey).forEach(function (coord) {
            var renderCoord = chunkCoordToRenderCoord(coord.x, coord.y);

            drawing.ctx.strokeRect(renderCoord.x, renderCoord.y, configuration.chunkWidth, configuration.chunkHeight);
        });
    };

    return world;
}

function handleMouseEvents(drawing, world) {
    var ctx     = drawing.ctx;
    var canvas  = drawing.canvas;

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

    window.addEventListener("resize", function () {
        // moving forces a rerender
        world.moveBy(0, 0);
    });

    canvas.addEventListener("az-drag", function (event) {
        if (event.which === MOUSE.middle) {
            padTheWorld(event);
        } else if (event.which === MOUSE.left) {
            drawALine(event);
        }
    });

    // replace with az-dragEnd >:(
    canvas.addEventListener("mouseup", function (event) {
        if (event.which === MOUSE.left) {
            // there's a problem with update chunks, for a chunk it's possible to reside outside the canvas only halfway for example
            // when the canvas tries to update that chunk, it will overwrite his clipped data with 0's, you will lose the clipped data!
            world.updateChunks();
        }
    });

    // prevents the annoying scrolling popup thing on middle mouse click
    window.addEventListener("mousedown", function (event) {
        if (event.which === MOUSE.middle) {
            event.preventDefault();
        }
    });
}

var drawing = initializeCanvas();
var world = initializeWorld(drawing);

handleMouseEvents(drawing, world);

function findAllNonEmptyChunks() {
    var keys = Object.keys(world.chunks).filter(function (chunkKey) {
        return world.chunks[chunkKey].data.reduce(function (d, p) {return d + p}, 0) !== 0;
    });

    console.log(keys);
}