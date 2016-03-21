function fitCanvasToScreen(canvas) {
    console.log("resizing canvas! emptying screen");
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

    return ctx;
}

var ctx            = initializeCanvas();
var infinity       = infiniteCanvas.initialize(ctx);

var toolbox        = new Toolbox(ctx);
var user_interface = new InfiniteCanvasUserInterface(infinity, ctx, toolbox);
