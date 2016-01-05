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

    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;

    return ctx;
}

function handleMouseEvents(ctx, infiniteCanvas) {
    var canvas = ctx.canvas;

    function padTheWorld(event) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        infiniteCanvas.moveBy(-event.dx, -event.dy);
    }

    function drawALine(event) {
        ctx.beginPath();
        ctx.moveTo(event.previousMousePosition.clientX, event.previousMousePosition.clientY);
        ctx.lineTo(event.clientX, event.clientY);
        ctx.stroke();
    }

    window.addEventListener("resize", function() {
        // moving forces a rerender
        infiniteCanvas.moveBy(0, 0);
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
            infiniteCanvas.updateChunks();
        }
    });

    // prevents the annoying scrolling popup thing on middle mouse click
    window.addEventListener("mousedown", function(event) {
        if (event.which === MOUSE.middle) {
            event.preventDefault();
        }
    });
}

var ctx = initializeCanvas();
var infinity = infiniteCanvas.initialize(ctx);

handleMouseEvents(ctx, infinity);