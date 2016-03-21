function InfiniteCanvasUserInterface(infinity, ctx, toolbox) {
	var canvas = ctx.canvas;

	window.addEventListener("resize", function() {
	    // moving forces a rerender
	    infinity.moveBy(0, 0);
	    // a resized canvas loses all its state
	    toolbox.commitToCtx();
	});

	canvas.addEventListener("az-drag", function (event) {
		if (event.which === MOUSE.middle) {
	        ctx.clearRect(0, 0, canvas.width, canvas.height);
			infinity.moveBy(-event.dx, -event.dy);
		}
	});

	// when done drawing a line, update the underlying buffer
	canvas.addEventListener("az-dragEnd", function(event) {
	    if (event.which === MOUSE.left) {
	        infinity.updateChunks();
	    }
	});

	// prevents the annoying scrolling popup thing on middle mouse click
	window.addEventListener("mousedown", function(event) {
	    if (event.which === MOUSE.middle) {
	        event.preventDefault();
	    }
	});

	createCircularMenu({
	    data: [
	        {color: "black",     pencil: true},
	        {color: "green",     pencil: true},
	        {color: "orangered", pencil: true},
	        {color: "white",     eraser: true}
	    ],
	    radius: 40,
	    menuSelectionHandler: function (selection) {
	        if (selection.pencil) {
	        	toolbox.setColor(selection.color);
	        	toolbox.setRadius(2);
	        } else if (selection.eraser) {
	        	toolbox.setColor("white");
	        	toolbox.setRadius(20);
	        }
	    }
	});
}